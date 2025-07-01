function questionData() {
  return [
    {
      userId: 1,
      questionId: 1,
      title: "Taiwan's Capital City",
      question: "The capital city is situated in the north. What is it called?",
      option: ["Taipei", "Taichung", "Tainan", "Taidong"],
    },
    {
      userId: 1,
      questionId: 2,
      title: "Taiwan's Tallest Peak",
      question: `Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters.
      What is the highest peak, meaning "Jade Mountain," in Taiwan at 3,952 meters?`,
      option: ["Alishan", "Chushan", "Tienmu", "Yushan"],
    },
    {
      userId: 1,
      questionId: 3,
      title: "Sky Lantern Festival",
      question: `Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?`,
      option: ["Jiufen", "Pingxi", "Tamsui", "Kenting"],
    },
    {
      userId: 1,
      questionId: 4,
      title: "Taiwan’s Indigenous Languages",
      question: `Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar?
      Which language family do Taiwan’s indigenous languages belong to?`,
      option: ["Min ", "Austro-Asiatic", "Austronesian", "Sino-Tibetan"],
    },
    {
      userId: 1,
      questionId: 5,
      title: "Temple Culture in Taiwan",
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: ["Guanyin", "Mazu", "Sun Wukong", "Confucius"],
    },
    {
      userId: 1,
      questionId: 6,
      title: "Language of Taiwan",
      question: "What is the official language of Taiwan?",
      option: null,
    },
  ];
}

function questionTestResult() {
  return [
    {
      userId: 1,
      count: 6,
    },
  ];
}

module.exports = { questionData, questionTestResult };
