export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const directusUrl = config.public.directusUrl;
  const staticTokenValue = config.directusStaticToken;

  if (!directusUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "Directus URL not configured",
    });
  }

  if (!staticTokenValue) {
    throw createError({
      statusCode: 500,
      statusMessage: "Directus static token not configured",
    });
  }

  // Normalize URL: remove trailing slash
  let normalizedUrl = directusUrl;
  if (normalizedUrl.endsWith("/")) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }

  try {
    // Read multipart form data
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No file provided",
      });
    }

    const uploadedFiles: { id: string }[] = [];

    // Upload each file
    for (const part of formData) {
      if (!part.filename) {
        continue; // Skip non-file parts
      }

      // Create FormData for Directus
      // Node.js 18+ FormData supports Buffer with options
      const directusFormData = new FormData();
      directusFormData.append("file", part.data, {
        filename: part.filename,
        contentType: part.type || "application/octet-stream",
      });

      // Upload to Directus using REST API
      const response = await $fetch<{ data: { id: string } }>(
        `${normalizedUrl}/files`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${staticTokenValue}`,
          },
          body: directusFormData,
        }
      );

      uploadedFiles.push({ id: response.data.id });
    }

    return {
      data: uploadedFiles,
    };
  } catch (error: any) {
    console.error("File upload error:", error);
    throw createError({
      statusCode: error?.statusCode || error?.status || 500,
      statusMessage:
        error?.statusMessage || error?.message || "Failed to upload file",
    });
  }
});
