'use strict';

require('dotenv').config();
const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');
const key = process.env.AZURE_COGNITIVE_KEY;
const endpoint = process.env.AZURE_COGNITIVE_URL;
const language = 'es';

// Auth client
const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));

// * Detect sentiment
async function sentimentAnalysis(client) {
  const sentimentInput = [
    "Existe una necesidad de mejorar la calidad de vida de los ciudadanos de las áreas rurales del Perú a través de la tecnología.",
  ];

  const sentimentResult = await client.analyzeSentiment(sentimentInput, language);

  sentimentResult.forEach(
    document => {
      console.log(`ID: ${document.id}`);
      console.log(`\tDocument Sentiment: ${document.sentiment}`);
      console.log(`\tDocument Scores:`);
      console.log(`\t\tPositive: ${document.confidenceScores.positive.toFixed(2)} \tNegative: ${document.confidenceScores.negative.toFixed(2)} \tNeutral: ${document.confidenceScores.neutral.toFixed(2)}`);
      console.log(`\tSentences Sentiment(${document.sentences.length}):`);
      document.sentences.forEach(sentence => {
          console.log(`\t\tSentence sentiment: ${sentence.sentiment}`)
          console.log(`\t\tSentences Scores:`);
          console.log(`\t\tPositive: ${sentence.confidenceScores.positive.toFixed(2)} \tNegative: ${sentence.confidenceScores.negative.toFixed(2)} \tNeutral: ${sentence.confidenceScores.neutral.toFixed(2)}`);
      });
    }
  );
}

sentimentAnalysis(textAnalyticsClient);

// * Detect opinions
async function sentimentAnalysisWithOpinionMining(client) {
  const sentimentInput = [
    {
      text: 'El servicio fue demasiado rápido, no vale lo que pagué.',
      id: '1',
      language: language
    },
    {
      text: 'La aplicación tiene muchas funciones, pero es fácil de usar.',
      id: '2',
      language: language
    },
    {
      text: 'Las llamadas deberían hacerse desde la aplicación y no desde Zoom o Google Meet.',
      id: '3',
      language: language
    },
  ];
  
  const results = await client.analyzeSentiment(sentimentInput, { includeOpinionMining: true });

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    console.log(`- Document ${result.id}`);
    if (!result.error) {
      console.log(`\tDocument text: ${sentimentInput[i].text}`);
      console.log(`\tOverall Sentiment: ${result.sentiment}`);
      console.log('\tSentiment confidence scores:', result.confidenceScores);
      console.log('\tSentences');
      for (const { sentiment, confidenceScores, opinions } of result.sentences) {
        console.log(`\t- Sentence Sentiment: ${sentiment}`);
        console.log('\t  Confidence scores:', confidenceScores);
        console.log('\t  Mined opinions');
        for (const { target, assessments } of opinions) {
          console.log(`\t\t- Target text: ${target.text}`);
          console.log(`\t\t  Target sentiment: ${target.sentiment}`);
          console.log('\t\t  Target confidence scores:', target.confidenceScores);
          console.log('\t\t  Target assessments');
          for (const { text, sentiment } of assessments) {
            console.log(`\t\t\t- Text: ${text}`);
            console.log(`\t\t\t  Assessment Sentiment: ${sentiment}`);
          }
        }
      }
    } else {
      console.error(`\tError: ${result.error}`);
    }
  }
}

sentimentAnalysisWithOpinionMining(textAnalyticsClient);

// * Recognize entities
async function recognizeEntities(client) {
  const entitiesInput = [
    'El incremento en los índices de sobrepeso y obesidad en el Perú es alarmante, según el Instituto Nacional de Estadística e Informática (INEI).',
    'Sólo en junio de 2020, el Ministerio de Salud alertaba que el 85% de las muertes por COVID-19 hasta esa fecha fueron de personas con obesidad.',
    'En este sentido, hablamos de una crisis de salud alimentaria que afecta a toda la población, con incidencia en las áreas urbanas.',
  ];

  const entitiesResult = await client.recognizeEntities(entitiesInput, language);

  for (const result of entitiesResult) {
    if (result.error) {
      console.error('Encountered an error:', result.error);
    } else {
      console.log(' -- Recognized entities for input', result.id, '--');
      for (const entity of result.entities) {
        console.log(entity.text, ':', entity.category, '(Score:', entity.confidenceScore, ')');
      }
    }
  }
}

recognizeEntities(textAnalyticsClient);

// * Recognize linked entities
async function recognizeLinkedEntities(client) {
  const linkedEntitiesInput = [
    'El incremento en los índices de sobrepeso y obesidad en el Perú es alarmante, según el Instituto Nacional de Estadística e Informática (INEI).',
    'Sólo en junio de 2020, el Ministerio de Salud alertaba que el 85% de las muertes por COVID-19 hasta esa fecha fueron de personas con obesidad.',
    'En este sentido, hablamos de una crisis de salud alimentaria que afecta a toda la población, con incidencia en las áreas urbanas.',
  ];

  const linkedEntitiesResult = await client.recognizeLinkedEntities(linkedEntitiesInput, language);

  for (const result of linkedEntitiesResult) {
    if (result.error) {
      console.error("Encountered an error:", result.error);
    } else {
      console.log(" -- Recognized linked entities for input", result.id, "--");
      for (const entity of result.entities) {
        console.log(entity.name, "(URL:", entity.url, ", Source:", entity.dataSource, ")");
        for (const match of entity.matches) {
          console.log(
            "  Occurrence:",
            '"' + match.text + '"',
            "(Score:",
            match.confidenceScore,
            ")"
          );
        }
      }
    }
  }
}

recognizeLinkedEntities(textAnalyticsClient);

// * Detect language
async function detectLanguage(client) {
  const detectLanguageInput = [
    'Este es un documento escrito en español.',
    'This is a document written in English.',
    'Isto é um documento escrito em português.',
  ];

  const detectLanguageResult = await client.detectLanguage(detectLanguageInput, 'none');

  for (const result of detectLanguageResult) {
    if (result.error) {
      console.error("Encountered an error:", result.error);
    } else {
      const { primaryLanguage } = result;
      console.log(
        "Input #",
        result.id,
        "identified as",
        primaryLanguage.name,
        "( ISO6391:",
        primaryLanguage.iso6391Name,
        ", Score:",
        primaryLanguage.confidenceScore,
        ")"
      );
    }
  }
}

detectLanguage(textAnalyticsClient);

// * Extract key phrases
async function extractKeyPhrases(client) {
  const extractKeyPhrasesInput = [
    'El incremento en los índices de sobrepeso y obesidad en el Perú es alarmante, según el Instituto Nacional de Estadística e Informática (INEI).',
    'Sólo en junio de 2020, el Ministerio de Salud alertaba que el 85% de las muertes por COVID-19 hasta esa fecha fueron de personas con obesidad.',
    'En este sentido, hablamos de una crisis de salud alimentaria que afecta a toda la población, con incidencia en las áreas urbanas.',
  ];

  const extractKeyPhrasesResult = await client.extractKeyPhrases(extractKeyPhrasesInput, language);

  for (const result of extractKeyPhrasesResult) {
    if (result.error) {
      console.error('Encountered an error:', result.error);
    } else {
      console.log(' -- Extract key phrases for input', result.id, '--');
      console.log(result.keyPhrases);
    }
  }
}

extractKeyPhrases(textAnalyticsClient);