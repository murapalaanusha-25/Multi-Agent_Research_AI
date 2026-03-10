from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from models.research import ResearchReport, ResearchRequest
from models.user     import User
from utils.auth      import get_current_user
from agents.orchestrator import run_research_pipeline
from datetime import datetime, timedelta
from bson import ObjectId
from bson.errors import InvalidId
import io

router = APIRouter()


def _to_oid(id_str: str):
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None


def _summary(r: ResearchReport) -> dict:
    return {
        "id":             str(r.id),
        "topic":          r.topic,
        "status":         r.status,
        "sections_count": len(r.sections),
        "word_count":     r.word_count,
        "created_at":     r.created_at,
    }


def _full(r: ResearchReport) -> dict:
    return {
        "id":           str(r.id),
        "topic":        r.topic,
        "subtopics":    r.subtopics,
        "sections":     [{"title": s.title, "content": s.content} for s in r.sections],
        "references":   r.references,
        "raw_content":  r.raw_content,
        "word_count":   r.word_count,
        "status":       r.status,
        "created_at":   r.created_at,
    }


# ── STATIC ROUTES FIRST (before /{report_id}) ─────────────────────────────────

@router.get("/history")
async def history(user: User = Depends(get_current_user)):
    reports = (
        await ResearchReport.find(ResearchReport.user_id == str(user.id))
        .sort(-ResearchReport.created_at)
        .to_list()
    )
    return [_summary(r) for r in reports]


@router.post("/generate")
async def generate(data: ResearchRequest, user: User = Depends(get_current_user)):
    report = ResearchReport(
        user_id=str(user.id),
        topic=data.topic,
        status="processing",
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30),
    )
    await report.insert()
    try:
        result = await run_research_pipeline(data.topic)
        report.subtopics   = result["subtopics"]
        report.sections    = result["sections"]
        report.references  = result["references"]
        report.raw_content = result["raw_content"]
        report.word_count  = result["word_count"]
        report.status      = "completed"
        await report.save()
        return _full(report)
    except Exception as e:
        report.status = "failed"
        await report.save()
        raise HTTPException(500, str(e))


# ── DYNAMIC ROUTES AFTER ───────────────────────────────────────────────────────

@router.get("/{report_id}")
async def get_report(report_id: str, user: User = Depends(get_current_user)):
    oid = _to_oid(report_id)
    if not oid:
        raise HTTPException(400, "Invalid report ID")
    r = await ResearchReport.get(oid)
    if not r or r.user_id != str(user.id):
        raise HTTPException(404, "Report not found")
    return _full(r)


@router.get("/{report_id}/download")
async def download(report_id: str, user: User = Depends(get_current_user)):
    oid = _to_oid(report_id)
    if not oid:
        raise HTTPException(400, "Invalid report ID")
    r = await ResearchReport.get(oid)
    if not r or r.user_id != str(user.id):
        raise HTTPException(404, "Report not found")
    # ── Build PDF with ReportLab ──────────────────────────────────────────────
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
        Table, TableStyle, KeepTogether
    )
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT

    buf = io.BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2.2 * cm,
        rightMargin=2.2 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    # ── Colour palette — light violet/teal theme ──────────────────────────────
    VIOLET      = colors.HexColor("#6d28d9")
    VIOLET_LIGHT= colors.HexColor("#8b5cf6")
    VIOLET_BG   = colors.HexColor("#f5f3ff")
    VIOLET_BORDER= colors.HexColor("#ddd6fe")
    TEAL        = colors.HexColor("#0d9488")
    TEAL_BG     = colors.HexColor("#f0fdf9")
    PAGE_BG     = colors.HexColor("#f8f7ff")
    WHITE       = colors.white
    TEXT_MAIN   = colors.HexColor("#111827")
    TEXT_SEC    = colors.HexColor("#374151")
    TEXT_MUTED  = colors.HexColor("#6b7280")
    BORDER      = colors.HexColor("#ede9fe")

    # ── Styles ────────────────────────────────────────────────────────────────
    title_style = ParagraphStyle(
        "ReportTitle",
        fontName="Helvetica-Bold",
        fontSize=24,
        textColor=TEXT_MAIN,
        alignment=TA_LEFT,
        spaceAfter=8,
        leading=30,
    )
    section_num_style = ParagraphStyle(
        "SectionNum",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=VIOLET,
        spaceBefore=20,
        spaceAfter=4,
        leading=14,
    )
    section_heading_style = ParagraphStyle(
        "SectionHeading",
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=TEXT_MAIN,
        spaceBefore=2,
        spaceAfter=8,
        leading=18,
    )
    body_style = ParagraphStyle(
        "BodyText",
        fontName="Helvetica",
        fontSize=10,
        textColor=TEXT_SEC,
        leading=17,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
    )
    subtopic_style = ParagraphStyle(
        "Subtopic",
        fontName="Helvetica",
        fontSize=9,
        textColor=TEAL,
        leftIndent=8,
        spaceAfter=4,
        leading=14,
    )
    ref_style = ParagraphStyle(
        "Reference",
        fontName="Helvetica",
        fontSize=8,
        textColor=TEXT_MUTED,
        leftIndent=14,
        spaceAfter=3,
        leading=12,
    )
    meta_label_style = ParagraphStyle(
        "MetaLabel",
        fontName="Helvetica",
        fontSize=8,
        textColor=TEXT_MUTED,
        spaceAfter=1,
    )
    meta_value_style = ParagraphStyle(
        "MetaValue",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=TEXT_MAIN,
        spaceAfter=0,
    )

    story = []
    page_w = A4[0] - 4.4 * cm   # usable width

    # ── Top brand bar ─────────────────────────────────────────────────────────
    brand_data = [[
        Paragraph(
            '<font color="#6d28d9"><b>Research</b></font><font color="#111827"><b>AI</b></font>',
            ParagraphStyle("Brand", fontName="Helvetica-Bold", fontSize=11, textColor=TEXT_MAIN)
        ),
        Paragraph(
            "MULTI-AGENT RESEARCH PLATFORM",
            ParagraphStyle("BrandSub", fontName="Helvetica", fontSize=7,
                           textColor=TEXT_MUTED, alignment=TA_RIGHT, letterSpacing=0.8)
        ),
    ]]
    brand_tbl = Table(brand_data, colWidths=[page_w * 0.5, page_w * 0.5])
    brand_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), WHITE),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW",     (0, 0), (-1, 0), 1, BORDER),
    ]))
    story.append(brand_tbl)

    # ── Title block ───────────────────────────────────────────────────────────
    title_data = [[Paragraph(r.topic, title_style)]]
    title_tbl = Table(title_data, colWidths=[page_w])
    title_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), VIOLET_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 22),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 22),
        ("LEFTPADDING",   (0, 0), (-1, -1), 18),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 18),
        ("LINEBELOW",     (0, 0), (-1, 0), 2, VIOLET),
    ]))
    story.append(title_tbl)

    # ── Meta bar ──────────────────────────────────────────────────────────────
    date_str = r.created_at.strftime("%B %d, %Y")
    meta_cells = [
        [Paragraph("Generated", meta_label_style), Paragraph(date_str, meta_value_style)],
        [Paragraph("Words",     meta_label_style), Paragraph(str(r.word_count), meta_value_style)],
        [Paragraph("Sections",  meta_label_style), Paragraph(str(len(r.sections)), meta_value_style)],
        [Paragraph("Subtopics", meta_label_style), Paragraph(str(len(r.subtopics)), meta_value_style)],
    ]
    # transpose into single row of 4 cells, each cell = stacked label+value
    meta_row = [[Table([c], colWidths=[page_w/4 - 6]) for c in meta_cells]]
    meta_tbl = Table(meta_row, colWidths=[page_w / 4] * 4)
    meta_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), WHITE),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 14),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 14),
        ("LINEBELOW",     (0, 0), (-1, 0), 1, BORDER),
    ]))
    story.append(meta_tbl)
    story.append(Spacer(1, 20))

    # ── Subtopics pill row ────────────────────────────────────────────────────
    if r.subtopics:
        st_heading = Paragraph(
            "RESEARCH SUBTOPICS",
            ParagraphStyle("StHead", fontName="Helvetica-Bold", fontSize=8,
                           textColor=VIOLET, spaceAfter=8, letterSpacing=0.6)
        )
        st_items = [Paragraph(f"› {st}", subtopic_style) for st in r.subtopics]
        st_content = [st_heading] + st_items
        st_tbl = Table([[st_content]], colWidths=[page_w])
        st_tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), TEAL_BG),
            ("TOPPADDING",    (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("LEFTPADDING",   (0, 0), (-1, -1), 16),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
            ("LINEBEFORE",    (0, 0), (0, -1), 3, TEAL),
        ]))
        story.append(st_tbl)
        story.append(Spacer(1, 16))

    # ── Report sections ───────────────────────────────────────────────────────
    for i, section in enumerate(r.sections):
        section_block = []

        # Section number badge + title
        num_str = str(i + 1).zfill(2)
        section_block.append(Paragraph(
            f'{num_str}  ·  <font color="#7c3aed">{section.title.upper()}</font>',
            ParagraphStyle("SecHead", fontName="Helvetica-Bold", fontSize=12,
                           textColor=TEXT_MAIN, spaceBefore=18, spaceAfter=6, leading=18)
        ))
        section_block.append(HRFlowable(
            width="100%", thickness=1, color=BORDER,
            spaceAfter=10, spaceBefore=0,
        ))

        paragraphs = [p.strip() for p in section.content.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [section.content.strip()]
        for para in paragraphs:
            clean = para.replace("\n", " ").strip()
            if clean:
                section_block.append(Paragraph(clean, body_style))
        section_block.append(Spacer(1, 4))

        story.append(KeepTogether(section_block[:3]))
        for item in section_block[3:]:
            story.append(item)

    # ── References ────────────────────────────────────────────────────────────
    if r.references:
        story.append(Spacer(1, 12))
        story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10))
        story.append(Paragraph("REFERENCES", ParagraphStyle(
            "RefHead", fontName="Helvetica-Bold", fontSize=9,
            textColor=TEXT_MUTED, spaceAfter=8, letterSpacing=0.6,
        )))
        for idx, ref in enumerate(r.references, 1):
            story.append(Paragraph(f"[{idx}]  {ref}", ref_style))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 22))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=8))
    story.append(Paragraph(
        "Generated by ResearchAI · Multi-Agent Research Platform · Powered by Groq Llama 3",
        ParagraphStyle("Footer", fontName="Helvetica", fontSize=7,
                       textColor=TEXT_MUTED, alignment=TA_CENTER),
    ))

    doc.build(story)
    buf.seek(0)

    safe_topic = r.topic.replace(" ", "_").replace("/", "-")[:40]
    filename   = f"ResearchAI_{safe_topic}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )



@router.delete("/{report_id}")
async def delete_report(report_id: str, user: User = Depends(get_current_user)):
    oid = _to_oid(report_id)
    if not oid:
        raise HTTPException(400, "Invalid report ID")
    r = await ResearchReport.get(oid)
    if not r or r.user_id != str(user.id):
        raise HTTPException(404, "Report not found")
    await r.delete()
    return {"message": "Deleted"}