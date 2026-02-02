
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory, Item } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-3-flash-preview';

const expenseCategories = Object.values(ExpenseCategory);

const schema = {
  type: Type.OBJECT,
  properties: {
    payee: {
      type: Type.STRING,
      description: "The name of the merchant or person the expense was paid to.",
    },
    amount: {
      type: Type.NUMBER,
      description: "The total amount of the expense as a numeric value.",
    },
    date: {
      type: Type.STRING,
      description: "The date of the expense in YYYY-MM-DD format.",
    },
    category: {
      type: Type.STRING,
      enum: expenseCategories,
      description: `The category of the expense. Must be one of: ${expenseCategories.join(', ')}.`,
    },
    description: {
        type: Type.STRING,
        description: "A brief, one-sentence description of the overall purchase."
    },
    items: {
        type: Type.ARRAY,
        description: "An array of objects, where each object represents a line item from the receipt with its name and price.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: {
                    type: Type.STRING,
                    description: "The name of the individual item purchased."
                },
                price: {
                    type: Type.NUMBER,
                    description: "The price of the individual item."
                }
            },
            required: ['name', 'price']
        }
    }
  },
  required: ['payee', 'amount', 'date', 'category'],
};

export const analyzeReceipt = async (base64Image: string, mimeType: string) => {
  try {
    const prompt = `Analyze this receipt image and extract the expense details. 
- Identify the merchant (payee), total amount, and date.
- Assign an overall category.
- Provide a brief, one-sentence description of the purchase.
- List each individual item from the receipt as an array of objects, where each object has a 'name' and a 'price'. This should be in the 'items' field.
If any information cannot be found, use a sensible default or 'N/A'. The sum of the item prices does not need to match the total amount.`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };
    
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    if (!response.text) {
        throw new Error("AI response was empty.");
    }

    const parsedJson = JSON.parse(response.text);
    
    // Validate category
    if (!expenseCategories.includes(parsedJson.category as ExpenseCategory)) {
        parsedJson.category = ExpenseCategory.Other;
    }

    return parsedJson as { payee: string; amount: number; date: string; category: ExpenseCategory; description?: string; items?: Item[] };

  } catch (error) {
    console.error("Error analyzing receipt with Gemini API:", error);
    throw new Error("Failed to analyze the receipt. Please try again or enter details manually.");
  }
};
