import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "/footquiz/",

    plugins: [
        VitePWA({
            registerType: "autoUpdate",

            manifest: {
                name: "FootQuiz",
                short_name: "FootQuiz",

                theme_color: "#0f1b3d",

                background_color: "#0f1b3d",

                display: "standalone",

                start_url: "/footquiz/",

                icons: [
                    {
                        src: "icon-192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "icon-512.png",
                        sizes: "512x512",
                        type: "image/png"
                    }
                ]
            }
        })
    ]
});