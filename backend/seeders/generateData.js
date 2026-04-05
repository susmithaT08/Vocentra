const fs = require('fs');

const generateDictionary = () => {
    const words = [];
    const partsOfSpeech = ['noun', 'verb', 'adjective', 'adverb', 'pronoun'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    for (let i = 1; i <= 3000; i++) {
        const difficulty = difficulties[i % 3];
        const categories = ['Daily Words', 'Academic Words', 'Business Words', 'Interview Vocabulary', 'Conversation Vocabulary'];
        const category = categories[i % 5];
        let wordStr = `vocab_${difficulty.toLowerCase()}_${i}`;

        words.push({
            word: wordStr,
            meaning: `This is the generated meaning for the dictionary word numbering ${i}.`,
            pronunciation: '/wɜrd/',
            audioUrl: 'https://www.example.com/audio.mp3',
            partOfSpeech: partsOfSpeech[i % 5],
            synonyms: [wordStr + '_syn1', wordStr + '_syn2'],
            antonyms: [wordStr + '_ant1'],
            examples: [`Here is a real world example showing how ${wordStr} is used in a sentence.`],
            context: 'General Usage',
            difficulty: difficulty,
            category: category
        });
    }

    // Add a few real, recognizable words for the live test
    words.push({
        word: 'ubiquitous',
        meaning: 'Present, appearing, or found everywhere.',
        pronunciation: '/juːˈbɪkwɪtəs/',
        audioUrl: 'https://example.com/audio/ubiquitous.mp3',
        partOfSpeech: 'adjective',
        synonyms: ['omnipresent', 'everywhere', 'pervasive'],
        antonyms: ['rare', 'scarce'],
        examples: ['His ubiquitous influence was felt by all the family.', 'Smartphones have become ubiquitous in modern society.'],
        context: 'Technology/Society',
        difficulty: 'Advanced'
    });

    words.push({
        word: 'benevolent',
        meaning: 'Well meaning and kindly.',
        pronunciation: '/bəˈnevələnt/',
        audioUrl: 'https://example.com/audio/benevolent.mp3',
        partOfSpeech: 'adjective',
        synonyms: ['kind', 'compassionate', 'caring'],
        antonyms: ['malevolent', 'unkind'],
        examples: ['A benevolent smile.', 'The company has a benevolent fund.'],
        context: 'Social',
        difficulty: 'Intermediate'
    });

    console.log(`Generated ${words.length} dictionary entries.`);
    fs.writeFileSync('dictionary.json', JSON.stringify(words, null, 2));
    console.log('Successfully saved to dictionary.json');
};

generateDictionary();
