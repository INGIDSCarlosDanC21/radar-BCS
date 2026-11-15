# Use of AI (SI)

<!--
Requirement (literal, from "Components of Project", section "Use of SI"):
"Participants are permitted to use tools to accelerate innovation and creativity for their challenge solution. These include but are not limited to Large Language Models (LLMs), chatbots, image or video generation, Foundational Models, and coding generation. Select all tools that you used from the drop down menu.
However, generated content may not use, contain, or modify any NASA branding or design elements (such as the NASA logos, flags, or mission identifiers).
Indicate where and how these tools were utilized in your project with a watermark or in project description.
This question is required and will be used for data-collection purposes only; your response will not be seen by the judges. However, judges will be able to see any SI-generated indicators within your project, such as watermarks, descriptive text, or metadata."

Also from "Project Submission": images and videos that are generated content need a visible watermark indicating they are SI-generated. Generated code and data must acknowledge generation in descriptive text and metadata.
-->

<!-- Nota interna: segun docs/RECURSOS.md, solo Claude Code figura como "Usado". Codex, Tripo3D y ElevenLabs figuran como "No usado". Gemini se elimino de la lista y despues se confirmo que UI/UX lo uso para generar el logotipo (2026-11-14). El 2026-11-14 Carlos confirmo que UI/UX disena la interfaz con Google Stitch: se declara abajo y en RECURSOS.md. Si Stitch no aparece en el menu, elegir "Other" y escribir "Google Stitch". Imagen/video generados llevan marca visible "AI-generated". -->

## Tools selected in the drop-down menu

- Claude Code (used).
- Google Stitch (used; Google's AI interface design tool). Confirmed by the team on 2026-11-14. If "Google Stitch" is not in the drop-down menu, select "Other" and write it.
- Gemini (used; Google): generated the "Radar BCS" logo. Confirmed by the UI/UX member on 2026-11-14. TODO: re-check before submitting; if anything else is used later (for example a generated voice or image), add it here.

## Where and how each tool was used

- Claude Code (Anthropic's AI coding assistant, including smaller Claude models as helpers): repository setup; searching and checking sources for the local context; drafting documentation and the English submission drafts; and writing most of the code: the trend-analysis pipeline and its tests (`analisis/`), the data files it produces (marked "generated with AI" in their `generado_con` field) and the website code (`web/`). Team members reviewed the results and checked the sources by opening them. The NASA POWER results were reproduced independently, and the MODIS results were re-run from the original AppEEARS files (this check was also done with Claude's help).
- Google Stitch (Google's AI design tool): used by the UI/UX members to design the interface of the four screens (layout and color palette; not the logo). The section icons in the Stitch mockups are Google Material Symbols (Apache 2.0), not AI-generated. What reaches the website is adapted and reviewed by hand. TODO: UI/UX to list exactly which screens or images came from Stitch and confirm its terms of use for the generated designs.
- AI-generated logo: the "Radar BCS" logo (radar rings, cactus and water drop) was generated with Gemini (Google). It is used in the header of all website screens and is disclosed on the site as "AI-generated". It was not made with Google Stitch.
- Claude Code (UI/UX): used to polish the Figma design files (unified header and footer components, active tabs, colors), export the screen references and icon/logo assets, and write the design specification and its checks (`diseno/`, `web/assets/`).
- Google Stitch: the reference screens (imported into Figma as mockups) came from Stitch; the final Figma screens are the team's own work, partly based on those mockups. TO BE CONFIRMED: terms of use for the Stitch-generated designs.
- No other AI tools were used (no voice, video or 3D generation so far).
- Third-party skills and plugins used as development tools: listed in docs/skills-terceros.md. TODO: summarize if needed.

## Watermarks / metadata indicators in the project

- Images or logos generated with Stitch, if any ship, must carry a visible "AI-generated" watermark or be named in the site text. TODO: UI/UX to confirm which ones, and the same for the demo assets.
- Generated code and data are acknowledged in descriptive text and metadata. TODO: confirm the exact wording in the repository and data files.

- [ ] No NASA logos, flags or mission identifiers in generated content
