// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    // Server-side only (private)
    directusStaticToken: process.env.DIRECTUS_STATIC_TOKEN || "",
    public: {
      directusUrl:
        process.env.NUXT_PUBLIC_DIRECTUS_URL ||
        process.env.NEXT_PUBLIC_DIRECTUS_URL ||
        "",
    },
  },

  app: {
    head: {
      title: "Lumera - Takı E-Ticaret",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Lumera takı koleksiyonu - Özel tasarım takılar",
        },
      ],
      htmlAttrs: {
        lang: "tr",
      },
    },
  },

  typescript: {
    strict: true,
  },
});
