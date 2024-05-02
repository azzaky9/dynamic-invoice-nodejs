const { PatchType, TextRun } = require("docx");

/**
 * Generate a text run for a paragraph.
 *
 * @param {string} value - The text value.
 * @param {boolean} bold - Whether the text should be bold.
 * @param {object} otherConfigText - Other configuration options for the text run.
 * @returns {object} - The generated text run object.
 */
const generateText = (value, bold, otherConfigText) => {
  return {
    type: PatchType.PARAGRAPH,
    children: [
      new TextRun({
        text: value,
        bold
        // ...otherConfigText
      })
    ]
  };
};

module.exports = { generateText };
