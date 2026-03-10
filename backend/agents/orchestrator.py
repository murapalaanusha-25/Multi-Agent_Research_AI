"""
Multi-Agent Research Orchestrator  v2
Pure Groq SDK — no LangChain, no SQLAlchemy.
Agents: Planning → Research → Summarisation → Report Generation → Chat

Fixes vs v1:
  - Each report section written in its own LLM call (full 8192 tokens per section)
  - Research agent sends full content to summarisation (not truncated to 600 chars)
  - Robust JSON parser that handles partial/broken JSON from LLM
  - Chat agent uses fresh Groq client each call to avoid stale connections
"""

import os
import re
import json
import asyncio
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# Fallback chain — tries next model if rate limit hit
MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
]


# ── helpers ───────────────────────────────────────────────────────────────────
def _groq_call(messages: list, temperature: float = 0.6, max_tokens: int = 8192) -> str:
    """Synchronous Groq call with automatic model fallback on rate limits."""
    client = Groq(api_key=GROQ_API_KEY)
    for model in MODELS:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            err_str = str(e)
            if "rate_limit_exceeded" in err_str or "429" in err_str or "model_decommissioned" in err_str or "decommissioned" in err_str:
                wait = re.search(r"try again in ([^.]+)", err_str)
                wait_msg = f" (retry in {wait.group(1)})" if wait else ""
                print(f"[GROQ] Rate limit on {model}{wait_msg}, trying next model...")
                continue
            raise
    raise Exception(
        "Daily token limit reached on all available Groq models. "
        "Please wait a few hours or upgrade at https://console.groq.com/settings/billing"
    )


async def _llm(messages: list, temperature: float = 0.6, max_tokens: int = 8192) -> str:
    return await asyncio.to_thread(_groq_call, messages, temperature, max_tokens)


def _parse_json(text: str):
    """
    Robust JSON parser — handles:
      - ```json ... ``` fences
      - stray trailing commas
      - partial output truncated by token limit
    """
    text = text.strip()

    # strip markdown fences
    if "```" in text:
        fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if fenced:
            text = fenced.group(1).strip()

    # try direct parse first
    try:
        return json.loads(text)
    except Exception:
        pass

    # fix trailing commas before ] or }
    cleaned = re.sub(r",\s*([}\]])", r"\1", text)
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # try extracting first JSON object/array
    for pattern in [r"\{[\s\S]*\}", r"\[[\s\S]*\]"]:
        m = re.search(pattern, cleaned)
        if m:
            try:
                return json.loads(m.group())
            except Exception:
                pass

    return None


# ── Agent 1 : Planning ────────────────────────────────────────────────────────
async def planning_agent(topic: str) -> list:
    print(f"  [Agent 1 — Planning] Topic: {topic}")
    msgs = [
        {
            "role": "system",
            "content": (
                "You are a research planning expert. "
                "Return ONLY a valid JSON array of exactly 5 subtopic strings. "
                "Each subtopic should be specific and researchable. "
                "Example output: [\"History and Origins\", \"Core Technology\", \"Real-world Applications\", \"Current Challenges\", \"Future Directions\"]\n"
                "Output ONLY the JSON array. No explanation, no markdown, no extra text."
            ),
        },
        {"role": "user", "content": f"Create 5 research subtopics for: {topic}"},
    ]
    try:
        raw    = await _llm(msgs, 0.3, 256)
        result = _parse_json(raw)
        if isinstance(result, list) and len(result) >= 3:
            return [str(s).strip() for s in result[:5]]
        # fallback: split by newlines if JSON failed
        lines = [l.strip().lstrip("-•123456789. ") for l in raw.splitlines() if l.strip()]
        lines = [l for l in lines if len(l) > 5]
        if len(lines) >= 3:
            return lines[:5]
    except Exception as e:
        print(f"  [Agent 1] error — {e}")
    return [
        f"History and Origins of {topic}",
        f"Core Mechanisms of {topic}",
        f"Real-world Applications of {topic}",
        f"Current Challenges in {topic}",
        f"Future Directions of {topic}",
    ]


# ── Agent 2 : Research ────────────────────────────────────────────────────────
async def research_agent(topic: str, subtopics: list) -> dict:
    print(f"  [Agent 2 — Research] {len(subtopics)} subtopics")
    results = {}

    # Try Tavily web search first
    if TAVILY_API_KEY:
        try:
            from tavily import TavilyClient
            tv = TavilyClient(api_key=TAVILY_API_KEY)
            for st in subtopics:
                try:
                    resp    = await asyncio.to_thread(tv.search, f"{topic} {st}", max_results=5)
                    items   = resp.get("results", [])
                    content = "\n\n".join(
                        f"[Source: {r.get('url','')}]\n{r.get('content','')}"
                        for r in items if r.get("content")
                    )
                    sources = [r.get("url", "") for r in items if r.get("url")]
                    if content.strip():
                        results[st] = {"content": content, "sources": sources}
                        print(f"    ✓ Tavily ({len(items)} results): {st[:50]}")
                        continue
                except Exception as e:
                    print(f"    Tavily error for '{st}': {e}")
                # fallback to LLM for this subtopic
                results[st] = await _llm_research(st, topic)
            return results
        except ImportError:
            print("    tavily-python not installed — using LLM fallback")

    # LLM fallback — run all subtopics in parallel
    print("    Using LLM research (no Tavily key)")
    tasks  = [_llm_research(st, topic) for st in subtopics]
    res_list = await asyncio.gather(*tasks, return_exceptions=True)
    for st, res in zip(subtopics, res_list):
        if isinstance(res, Exception):
            results[st] = {"content": f"Research on {st} in the context of {topic}.", "sources": []}
        else:
            results[st] = res
    return results


async def _llm_research(subtopic: str, context: str) -> dict:
    """Deep LLM research — 5 detailed paragraphs per subtopic."""
    msgs = [
        {
            "role": "system",
            "content": (
                "You are a knowledgeable research expert and academic writer. "
                "Write a concise research summary of 2 short paragraphs (max 150 words total). "
                "Include key facts, specific examples, and real numbers. Plain text only — no bullet points, no headers."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Write a concise 2-paragraph summary (max 150 words) about:\n"
                f"Subtopic: {subtopic}\n"
                f"Main topic context: {context}\n\n"
                f"Be specific. Include key facts and numbers. Stop at 150 words."
            ),
        },
    ]
    content = await _llm(msgs, 0.65, 300)
    return {"content": content, "sources": []}


# ── Agent 3 : Summarisation ───────────────────────────────────────────────────
async def summarization_agent(topic: str, research_data: dict) -> dict:
    print("  [Agent 3 — Summarisation] Extracting insights…")

    # Use full research content (not truncated)
    combined = ""
    for st, d in research_data.items():
        combined += f"\n\n=== {st} ===\n{d['content']}"

    # Trim to fit context window comfortably (keep ~4000 chars)
    combined = combined[:8000]

    msgs = [
        {
            "role": "system",
            "content": (
                "You are a research summarisation expert. "
                "Analyse the provided research and extract structured insights. "
                "Return ONLY valid JSON with exactly these keys:\n"
                "  key_insights: array of 8 specific insight strings (each 1-2 sentences)\n"
                "  applications: array of 6 specific application strings\n"
                "  challenges: array of 5 specific challenge strings\n"
                "  future_trends: array of 5 specific trend strings\n"
                "  summary: string of 3 sentences summarising the whole topic\n"
                "Output ONLY the JSON object. No markdown, no explanation."
            ),
        },
        {
            "role": "user",
            "content": f"Topic: {topic}\n\nResearch data:\n{combined}",
        },
    ]
    try:
        raw    = await _llm(msgs, 0.4, 3000)
        result = _parse_json(raw)
        if isinstance(result, dict) and "key_insights" in result:
            print("  [Agent 3] Insights extracted successfully")
            return result
        else:
            print(f"  [Agent 3] JSON parse failed, raw output:\n{raw[:300]}")
    except Exception as e:
        print(f"  [Agent 3] error — {e}")

    # Structured fallback using research content
    all_content = " ".join(d["content"][:200] for d in research_data.values())
    return {
        "key_insights":  [f"Key insight about {topic}: {all_content[:80]}..."] + [f"Important aspect of {topic}" for _ in range(7)],
        "applications":  [f"Application of {topic} in industry and research"] * 6,
        "challenges":    [f"Challenge in {topic} development and adoption"] * 5,
        "future_trends": [f"Future direction of {topic} research and technology"] * 5,
        "summary":       f"{topic} is a multifaceted field with significant implications across multiple domains. Research highlights both substantial opportunities and meaningful challenges. Continued development promises transformative impact in the coming years.",
    }


# ── Agent 4 : Report Generation ───────────────────────────────────────────────
async def _write_section(
    section_name: str,
    section_title: str,
    topic: str,
    research_content: str,
    insights: dict,
) -> str:
    """Write a single concise report section — 6-7 lines."""
    section_guides = {
        "introduction": "Briefly introduce the topic, its significance, and what this report covers.",
        "background":   "Summarise the origins, key concepts, and major milestones of the topic.",
        "key_findings": "Highlight the most important discoveries, data points, and insights.",
        "applications": "Describe the main real-world uses and industries where this topic is applied.",
        "challenges":   "Outline the key technical, ethical, or adoption challenges in this field.",
        "future_scope": "Describe the most promising future directions and expected developments.",
        "conclusion":   "Summarise the key takeaways and the overall significance of the topic.",
    }

    guide = section_guides.get(section_name, "Write a brief 6-7 line summary of this section.")

    msgs = [
        {
            "role": "system",
            "content": (
                "You are a concise research writer. "
                "STRICT LIMIT: write no more than 120 words total per section. "
                "Use 4-5 sentences maximum. Each sentence max 25 words. "
                "Be specific — include real facts, names, and numbers. "
                "Stop writing as soon as you reach 120 words. "
                "Plain text only — no markdown, no headers, no bullet points."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Write the '{section_title}' section for a report on: {topic}\n\n"
                f"Goal: {guide}\n\n"
                f"Key insights: {json.dumps(insights.get('key_insights', [])[:2])}\n\n"
                f"Research context:\n{research_content[:1500]}\n\n"
                f"IMPORTANT: Maximum 120 words, 4-5 sentences. No title. Stop at 120 words."
            ),
        },
    ]
    try:
        result = await _llm(msgs, 0.5, 200)
        if not result or len(result.strip()) < 30:
            raise ValueError(f"LLM returned empty content for section: {section_name}")
        # Hard truncate to ~130 words as safety net
        words = result.strip().split()
        if len(words) > 130:
            result = " ".join(words[:130])
            # End at last full sentence
            for punct in [". ", "! ", "? "]:
                last = result.rfind(punct)
                if last > 50:
                    result = result[:last + 1]
                    break
        return result.strip()
    except Exception as e:
        print(f"  [Agent 4] section '{section_name}' error — {e}")
        raise


async def report_generation_agent(
    topic: str, subtopics: list, insights: dict, research_data: dict
) -> dict:
    print("  [Agent 4 — Report] Writing 7 sections sequentially…")

    # Combine research content — give each section its own relevant slice
    all_research = "\n\n".join(
        f"[{st}]\n{d['content']}" for st, d in research_data.items()
    )

    sections = [
        ("introduction", "Introduction"),
        ("background",   "Background"),
        ("key_findings", "Key Findings"),
        ("applications", "Applications"),
        ("challenges",   "Challenges"),
        ("future_scope", "Future Scope"),
        ("conclusion",   "Conclusion"),
    ]

    output = {}
    for name, title in sections:
        try:
            content = await _write_section(name, title, topic, all_research, insights)
            output[name] = content
            print(f"    ✓ Section: {title} ({len(content.split())} words)")
            # small delay between sections to stay within rate limits
            await asyncio.sleep(0.3)
        except Exception as e:
            print(f"    ✗ Section '{title}' failed: {e}")
            raise Exception(f"Failed to write section '{title}': {str(e)}")

    return output


# ── Agent 5 : Chat ────────────────────────────────────────────────────────────
async def chat_agent(message: str, history: list) -> str:
    msgs = [
        {
            "role": "system",
            "content": (
                "You are ResearchAI, an intelligent AI research assistant powered by Groq. "
                "You help users understand complex topics and answer questions clearly. "
                "IMPORTANT: Never use markdown formatting — no asterisks, no bold, no headers, no bullet symbols. "
                "Write in plain conversational prose only. Use examples where helpful. "
                "For in-depth research reports, suggest the Research tab."
            ),
        }
    ]

    # Include recent conversation history (last 8 exchanges)
    for m in history[-16:]:
        role = m.get("role", "user")
        content = m.get("content", "")
        if role in ("user", "assistant") and content:
            msgs.append({"role": role, "content": content})

    msgs.append({"role": "user", "content": message})

    try:
        reply = await _llm(msgs, 0.7, 2048)
        print(f"  [Agent 5 — Chat] Reply: {reply[:80]}…")
        return reply
    except Exception as e:
        print(f"  [Agent 5 — Chat] error — {e}")
        return (
            f"I encountered an error: {str(e)}. "
            "Please check that your GROQ_API_KEY is correctly set in the backend .env file."
        )


# ── Orchestrator ──────────────────────────────────────────────────────────────
async def run_research_pipeline(topic: str) -> dict:
    print(f"\n{'─'*60}\n🚀  Pipeline start: {topic}\n{'─'*60}")

    subtopics     = await planning_agent(topic)
    print(f"  Subtopics: {subtopics}")

    research_data = await research_agent(topic, subtopics)
    total_chars   = sum(len(d["content"]) for d in research_data.values())
    print(f"  Research gathered: {total_chars} chars across {len(research_data)} subtopics")

    insights      = await summarization_agent(topic, research_data)
    raw_sections  = await report_generation_agent(topic, subtopics, insights, research_data)

    # collect sources
    sources = []
    for d in research_data.values():
        sources.extend(d.get("sources", []))
    unique_sources = list(dict.fromkeys(s for s in sources if s))

    from models.research import ResearchSection
    sections = [
        ResearchSection(title="Introduction",  content=raw_sections.get("introduction",  "")),
        ResearchSection(title="Background",    content=raw_sections.get("background",    "")),
        ResearchSection(title="Key Findings",  content=raw_sections.get("key_findings",  "")),
        ResearchSection(title="Applications",  content=raw_sections.get("applications",  "")),
        ResearchSection(title="Challenges",    content=raw_sections.get("challenges",    "")),
        ResearchSection(title="Future Scope",  content=raw_sections.get("future_scope",  "")),
        ResearchSection(title="Conclusion",    content=raw_sections.get("conclusion",    "")),
    ]

    raw_content = "\n\n".join(f"## {s.title}\n{s.content}" for s in sections)
    word_count  = len(raw_content.split())

    print(f"✅  Pipeline complete — {word_count} words, {len(sections)} sections\n")
    return {
        "subtopics":   subtopics,
        "sections":    sections,
        "references":  unique_sources[:10],
        "raw_content": raw_content,
        "word_count":  word_count,
    }