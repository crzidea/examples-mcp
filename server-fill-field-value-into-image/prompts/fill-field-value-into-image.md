# Fill Field Values into Image

## Objective

The goal is to fill specific field values into an image by converting the image into semantic HTML/CSS (not by embedding the original image as a background), retrieving the necessary field values, and inserting those values so the final rendered HTML is a faithful, print-ready reproduction of the original image. For uploaded images that are templates for employee enrollment documents or certificates (e.g. proof of employment), the LLM should prioritize producing a correct semantic structure and including all expected fields. Pixel-perfect visual matching is not required for this document type—reasonable layout, spacing and typographic choices that preserve readability and semantic correctness are acceptable.

## Document type inference and supported templates

Do not assume every uploaded image is a proof-of-employment certificate. The LLM must *infer the document type* from the image and produce an appropriate semantic HTML layout for that type. If the image is ambiguous, state the inferred type and the alternative plausible types in a short comment (e.g. `<!-- inferred-type: employment_certificate; alternatives: payslip, contract_summary -->`).

The LLM should select sensible structures for different kinds of documents (examples below) and may use reasonable spacing and typographic choices rather than pixel-perfect positioning. The key requirements remain: semantic correctness, print-readiness, and inclusion of all returned field values from `get_example_field_values` (each named field must be inserted exactly once unless the original shows multiple placeholders).

Common template categories and example fields (not exhaustive — always include any additional fields returned by `get_example_field_values`):

- **Employee enrollment / certificate (在职证明 / 证明书)**
  - Example fields: `company_name`, `company_address`, `document_title`, `certificate_number`, `employee_name`, `employee_id`, `position_title`, `department`, `start_date`, `end_date`, `issue_date`, `issuer_name`, `issuer_position`, `issuer_signature`, `company_seal`, `remarks`.

- **Payslip / salary statement (工资单)**
  - Example fields: `employee_name`, `employee_id`, `pay_period`, `base_salary`, `allowances`, `deductions`, `net_pay`, `taxes`, `employer_contributions`, `issue_date`.

- **Contract summary / appointment letter (合同摘要 / 任命函)**
  - Example fields: `employee_name`, `employee_id`, `position_title`, `start_date`, `contract_term`, `salary_terms`, `signatory_name`, `issue_date`.

- **ID card / badge (证件 / 工作证)**
  - Example fields: `holder_name`, `photo`, `id_number`, `valid_from`, `valid_to`, `department`, `position_title`.

- **Diploma / degree certificate (毕业证 / 学位证书)**
  - Example fields: `graduate_name`, `degree`, `major`, `institution_name`, `graduation_date`, `certificate_number`, `seal`.

- **Medical certificate / fitness note (医疗证明)**
  - Example fields: `patient_name`, `id_number`, `diagnosis`, `period_of_leave`, `doctor_name`, `issue_date`, `clinic_seal`.

For any inferred type, include placeholder elements or underlines for fields that are blank or optional (do not remove visual input lines). Follow the Field insertion and validation rules below to validate formats, normalize punctuation for Chinese contexts, and produce the one-line insertion summary comment before calling `save_example_html`.

## Required workflow

1. **Convert image elements into HTML structure**
   - Recreate all textual content as HTML text nodes (no text baked into a background image). Recreate all lines、underlines and graphical separators using CSS borders、SVG lines、or positioned elements so they scale and print cleanly. Crucially, these recreated visual elements (e.g., underlines, boxes), *including those for fields that may remain blank or are just labels*, must persist even when field values are inserted.
   - Use semantic containers (e.g. `<header>`, `<main>`, `<footer>`, or `<div class="field">`) and absolute positioning for fixed-layout areas. Provide explicit coordinate comments in the generated HTML (e.g. `<!-- bbox: left=120px top=80px width=300px height=24px -->`) so positions are auditable. All static text content must be accurately reproduced and positioned with pixel-perfect alignment.
   - For each recreated element，include a short “comparison note” comment explaining how it maps to the original (e.g. `<!-- original: title centered, bbox...; adjustments: increased letter-spacing by 0.5px to match optical impression -->`)。

2. **Font and text rendering**
   - Specify an explicit font stack that closely matches the original (e.g. `font-family: "Noto Sans", "Helvetica Neue", Arial, sans-serif;`)；if the original uses a proprietary font，approximate it with a similar web-safe or Google font and document the substitution in a comment using the format `<!-- font-sub: original="XXX" -> substitute="YYY" reason="ZZZ" -->`。**Crucially, experiment with `letter-spacing` and `font-weight` to optically match the original's appearance even if exact font metrics differ.**
   - Match `font-size`，`font-weight`，`line-height`，`letter-spacing` (tracking) and text-transform. Preserve measured font sizes from the original image using px or pt units for print stability (avoid rem/em scaling for fixed-layout reproduction). If any adjustment is necessary (e.g. to fit a value), document the exact change in a comparison note (e.g. `<!-- font-adjust: original=14px -> used=13px reason='reduced letter-spacing to fit' -->`).
   - For numeric fields (IDs，dates，phone numbers)，use a monospace or tabular-nums font-feature if alignment is required. Document any `font-variant-numeric: tabular-nums;` usage。

3. **Precise positioning and sizing**
   - Use `position: absolute` with pixel-accurate `top`/`left` and explicit `width`/`height` to match bounding boxes. Use `box-sizing: border-box` globally for predictable sizing。
   - Provide and use a global scale CSS variable (e.g. `--scale: 1`) so the entire document can be uniformly scaled if needed。
   - Recreate underlines and blank input lines using bottom borders on the field container (e.g. `span.field { border-bottom: 1.5px solid #000; display:inline-block; }`) rather than relying on character underscores or standalone underline nodes. If the original shows visually continuous underlines across adjacent fields, implement these as aligned border-bottoms on sibling field containers rather than a single long element to avoid accidental overlap. **Ensure underlines (border-bottom) are precisely aligned vertically and horizontally with their corresponding text and do not overlap with field values.**
     - Do NOT add `min-width`, `width`, or other forced width constraints to underline elements. Underlines must size or align to the adjacent field content or be explicitly given a computed pixel width from the original bbox, but avoid CSS rules that introduce minimum widths which can break short-value layouts.
     - When inserting a field value into an area that originally shows an underline or blank input line, preserve the underline by keeping it as a `border-bottom` on the field container and insert the value inside that container (for example: `<div class="field" role="textbox"><span class="field-value">Zhang San</span></div>` with `.field { border-bottom:1.5px solid #000; }`). Do not replace only the textual content and remove the underline style or convert it to a separate node.

4. **Colors，stroke widths，and line artifacts**
   - Use exact hex/RGB values for colors where visible. Match stroke widths for separators and underlines (e.g. `1px`、`1.5px`)。Avoid hairline issues by using non-zero widths that render consistently in print。

5. **Page size，print CSS and PDF readiness**
   - Set the viewport and `@page`/`@media print` rules so the rendered page size equals the original image physical dimensions at the chosen DPI (72–300 DPI). Document the DPI and the pixel-to-mm conversion used. Use fixed-size CSS (e.g. `width: 1280px; height: 1792px;` or `width: 210mm; height: 297mm;`) to avoid reflow。
   - Preserve page orientation (portrait vs landscape) explicitly via `@page { size: A4 portrait; }` or equivalent px/mm sizes。
   - Always apply the fixed page width and height to the `body` element, not only to a custom container. If a custom container is also used, mirror the same size on `body` to prevent incorrect page widths in renderers.
   - Include `@media print` rules to preserve fonts and colors before saving to PDF。

6. **Field insertion and validation**
   - Call the MCP tool `get_example_field_values` to fetch values. Validate types and lengths (e.g. date format YYYY‑MM‑DD，passport digits length) before rendering。
   - Build an explicit placeholder-to-target mapping before any text mutation: locate every placeholder token (e.g. `XX`、`XXX`、`_____`) and determine its canonical target element (selector or bbox). **Each named field MUST be inserted exactly once.**
     - Interpret and resolve short generic placeholder marks such as `X`, `XX`, `XXX`, `____`, `N/A` or similar: these are not literal output and typically stand for a real field value (name, company, country, date, numeric id, etc). The LLM must attempt to infer the intended field from nearby labels, punctuation, or layout context and replace the token with the corresponding value from `get_example_field_values`.
       - If inference is confident, insert the resolved value and add a short comment documenting the decision: `<!-- placeholder-resolve: 'XX' -> employee_name (reason: label '姓名' nearby) -->`。
       - If multiple plausible mappings exist, choose the most likely mapping and include an `alternatives` note listing other plausible interpretations.
       - Never leave raw placeholder tokens (e.g. `X`, `XX`, `____`) in the final saved HTML. If no suitable value exists in `get_example_field_values`, create a clearly marked empty placeholder element (for example `<span class="missing" aria-label="missing: employee_name"></span>`), record a one-line comparison note explaining why the value is missing and require human review, then abort saving and surface the issue.
       - If the placeholder indicates an image (photo, signature, or seal) and no image is available in `get_example_field_values`, insert a documented missing-image placeholder and follow the same abort-and-surface rule.
     - If the template contains both an inline placeholder and a separate standalone label/line for the same field, **prefer the inline placeholder** and do NOT create an additional standalone field. If the inline placeholder is missing but a standalone visual field exists, insert into the standalone field.
     - Never duplicate a field value by inserting it into multiple places unless the original image explicitly shows multiple distinct placeholders for that same value.
   - When inserting values, preserve the original surrounding punctuation and spacing. Do not introduce extra spaces or duplicate punctuation. For Chinese text use full-width punctuation; ensure there is no stray space immediately before punctuation.
   - Remove leading and trailing whitespace from every text node/line. Never start a line or block with a space. Ensure there is no leading space before labels or punctuation.
   - Do not introduce decorative punctuation or symbols that are not present in the original image (e.g., leading em dashes "——", bullets "•", middots "·", extra hyphens). Never prepend such characters at the beginning of a line or immediately before labels. If uncertain, omit the ornament and add a brief comparison note.
   - Normalize and trim field values prior to insertion. For Chinese contexts convert ASCII punctuation to full-width where appropriate. Remove leading/trailing whitespace and collapse multiple internal spaces to a single space unless the original layout requires different spacing.
   - Static sentence policy: Do not modify any static sentences or labels from the original image. Only fill values into explicit placeholder areas (e.g., underlines or `XX/XXX/____`). Keep fixed narrative sentences and labels verbatim—including punctuation and connective wording. If any paraphrase or alternative wording is generated, treat it as an error and revert to the source wording.
   - After insertion, run automated text-level validation checks **before saving**:
     1. No duplicate occurrences of the same field value (exact string match) unless there were multiple placeholders in the original.
     2. No doubled punctuation sequences (e.g. `：：`、`。。`) introduced by insertion.
     3. All placeholder tokens (e.g. `XX`,`XXX`,`____`) have been removed or replaced.
     4. No standalone empty label or orphaned punctuation was created.
     5. No stray decorative characters were added (e.g., leading "——"/"•"/"·" or repeated "—"). Pay special attention to line starts and segments before labels.
     6. Static text integrity check: verify that fixed sentences/labels are reproduced verbatim from the source (no paraphrasing or substitutions). If drift is detected, abort saving, restore the original wording, and re-validate spacing and punctuation.
     - If any check fails, abort saving, record the failure with a short comparison note, and surface the error so a human can review.
   - Only create new visual field elements (e.g. an extra `<div>` line) when the original image clearly requires a separate field. If created, the new element must include an explicit `<!-- bbox: ... -->` comment and a one-line comparison note explaining why the new element was necessary.
   - When a value risks overflowing its bounded visual area, attempt fixes in this order and document the chosen fallback in a comparison note: (1) reduce `letter-spacing`, (2) switch to tabular digits or a condensed numeric font via `font-variant-numeric: tabular-nums;`, (3) as last resort reduce `font-size`.
   - Ensure inserted values do not overlap underlines, borders, or other visual elements; adjust `top`/`left`/`padding` to guarantee clearance and preserve the visibility of recreated shapes.
   - Produce a one-line insertion summary comment before calling `save_example_html`, listing each field name and the selector or bbox where it was written (e.g. `<!-- summary: name->#field-name (left=60px top=180px) passport->span.passport (bbox=...) -->`).
   - Call `save_example_html` only after all validation checks pass and include the insertion summary comment in the saved HTML.

7. **Field Alignment and Non-Overlap**
   - Ensure that all inserted field values are precisely aligned with their corresponding placeholders (e.g. centered above an underline, or left-aligned within a box). **Implement a systematic process for measuring and verifying the coordinates of all key elements to ensure pixel-perfect alignment.**
   - Absolutely critical: Field values must NOT overlap or obscure any recreated visual elements (e.g. underlines、borders、static text). These visual elements must remain fully visible and distinct. **Precisely adjust `top`、`left`、or `padding` of field values to prevent any overlap and ensure sufficient clearance.**

8. **Comparison notes (optional)**
   - Optionally include brief human-readable comparison notes describing any detected discrepancies and corrective actions; do not require embedding debug JSON or CSS in the final output。

## Analysis checklist (compare original vs rendered)

- **Page size & orientation**：Confirm final canvas width/height and orientation match the original image exactly. Check for unexpected extra whitespace or cropping that indicates a scale/orientation mismatch。
- **Layout & vertical rhythm**：Verify title、header、body and footer vertical positions align to within a few pixels. Check left/right alignment and any centered elements for correct transform-origin。
- **Fonts & metrics**：Check font family、size、weight、letter-spacing and line-height；if different，document the substitution and include the `font-sub` comment. Verify numeric glyph width (tabular vs proportional) when alignment matters。
- **Underlines & separators**：Verify thickness、length、end-caps、and placement；ensure they are implemented as CSS/SVG elements with explicit coordinates, not characters。
- **Field placements & overlaps**：Confirm each filled value sits exactly on its placeholder line and does not overlap nearby text. For multi-line fields，verify wrapping behavior matches the original。
- **Numeric alignment**：Check that numbers (IDs、phone numbers、salaries) align visually like the original; use `font-variant-numeric: tabular-nums;` or monospace where necessary。
- **Colors & stroke widths**：Verify visible colors and border widths match the original。
- **Punctuation & ornaments**：Confirm no decorative punctuation or symbols were introduced during reconstruction. Compare start-of-line characters and label-adjacent positions against the original image。
- **Print/PDF output**：Render to PDF (headless Chrome or Puppeteer) and compare the PDF to the original image for page breaks、shifts、or font substitution issues。

## Common discrepancies and how to update the prompt to fix them

- **Rendered image has wrong orientation or large whitespace**：require explicit `@page` size and `width/height` in px/mm; ask implementer to report original image pixel dimensions and chosen DPI so the HTML uses consistent scale。
- **Title or blocks shifted horizontally/vertically**：require per-element bbox comments and absolute `top/left` values in px; require implementer to return a short table of measured bboxes for misaligned elements。
- **Font mismatch (optical size/weight differs)**：require an explicit font stack and an embedded webfont when possible; mandate a `<!-- font-sub: ... -->` comment and request an additional adjustment to `letter-spacing` or `font-weight` to match optical appearance。
- **Underlines drawn as characters or wrong length**：require underlines to be separate CSS/SVG elements with explicit `width`、`height`/`border-bottom` and coordinate comments; mandate splitting continuous lines into per-field elements。
- **Numeric fields misaligned or proportional digits used**：require `font-variant-numeric: tabular-nums;` or a monospace font for those fields and add an alignment test in the comparison notes。
- **Values overflow their bbox**：require implementer to try (in order) adjusting letter-spacing、switching to tabular digits、then reduce font-size；document whichever fallback was used。
- **Field values overlap recreated visual elements:** Emphasize that all recreated visual elements (underlines, borders) must remain fully visible and distinct. Require precise positioning adjustments to prevent any overlap, potentially by adjusting the `top`、`left` or `padding` of the field values。

## Final output requirements

- Provide a single、self-contained HTML file (styles may be inline or in a single `<style>` block) that reproduces the page visually and is ready to be converted to PDF。
- Include short comments for each major element indicating original coordinates、the source text it represents、and a one-line comparison note describing what was adjusted。
- Do NOT use the original image as a background. The original image must be reproduced entirely using HTML/CSS elements. Text and graphical shapes should be recreated using HTML elements whenever possible. Photographic or raster logos are allowed as separate `<img>` elements only when necessary and documented。
- Ensure that all recreated visual elements (e.g. underlines、borders) remain fully visible and distinct, and are not obscured by inserted field values, and are recreated even for fields that may remain blank or are just labels。
- Call `save_example_html` with the final HTML when the reproduction matches the original on the checklist and the PDF test passes。

## Considerations

- Use full-width punctuation for Chinese text（，、。；：？！“”‘’（）《》【】——……）。English sentences must use standard punctuation。
- Keep the generated HTML deterministic—avoid responsive units that cause reflow between environments。
- Keep changes concise and document any unavoidable approximations（font substitutions、DPI differences、or minor position shifts）。

