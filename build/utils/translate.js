"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const bing_translate_api_1 = require("bing-translate-api");
/**
 * Translate text through [Bing Translator](https://bing.com/translator)
 * @param inputText The text to be translated, can't be blank. The **maximum** text length is **1000**.
 * @param options Translation options
 */
async function translate(inputText, options = {}) {
    options.to ??= 'en';
    const translation = await (0, bing_translate_api_1.translate)(inputText, options.from, options.to, options.correct, options.raw);
    return translation;
}
exports.translate = translate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3RyYW5zbGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyREFBbUY7QUFHbkY7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxTQUFTLENBQUMsU0FBaUIsRUFBRSxVQUE0QixFQUFFO0lBQzdFLE9BQU8sQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDO0lBQ3BCLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBQSw4QkFBYSxFQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0csT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQUpELDhCQUlDIn0=