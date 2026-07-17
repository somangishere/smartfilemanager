from datetime import datetime

def format_date(dt):
    if not dt:
        return None
    return dt.isoformat()

def format_size(bytes_size: int) -> str:
    if bytes_size is None:
        return "—"

    mb = bytes_size / (1024 * 1024)
    if mb >= 1:
        return f"{mb:.1f} MB"

    kb = bytes_size / 1024
    return f"{kb:.1f} KB"

def short_summary(text: str, max_len: int = 100):
    if not text:
        return "No description"

    text = text.replace("\n", " ").strip()

    return text[:max_len] + "..." if len(text) > max_len else text