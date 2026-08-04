def estimate_tokens(text: str | None) -> int:
    """
    Estimates the number of tokens in a text string using standard heuristics.
    Falls back to a hybrid word-count and character-length model to be robust
    without requiring external binary packages (e.g. tiktoken).

    Args:
        text: Input string.

    Returns:
        Estimated token count.
    """
    if not text:
        return 0

    char_count = len(text)
    word_count = len(text.split())

    char_estimate = max(1, char_count // 4)
    word_estimate = max(1, int(word_count * 1.35))

    return max(char_estimate, word_estimate)
