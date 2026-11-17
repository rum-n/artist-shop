/**
 * Pulls a human-readable message out of a failed response.
 *
 * Not every failure comes from our own handlers: the hosting platform rejects
 * oversized request bodies with a plain-text "Request Entity Too Large" before
 * the route ever runs. Parsing those blindly as JSON surfaces a confusing
 * "is not valid JSON" error instead of the actual cause.
 */
export async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  if (response.status === 413) {
    return "The upload is too large. Please use a smaller image.";
  }

  try {
    const data = await response.json();
    if (data && typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // Non-JSON body (an error page from the host, for example).
  }

  return fallback;
}
