const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const questionUrl = new URL("/api/question", baseUrl);

const createAnswer = (profileIdLookup, questionIdLookup) => {
  test.each(answerData())("answer question $question_id by user $user_id", async (a) => {
    const response = await fetch(questionUrl + "/" + questionIdLookup.getQuestionId(a.question_id) + "/answer", {
      method: "POST",
      body: JSON.stringify({
        profile_id: profileIdLookup.getProfileId(a.user_id),
        question: a.question,
        option: a.option,
        answer: a.answer,
        duration: a.duration,
      }),
    });

    let answer = await response.json();
    // let answerId = answer.return.id;
    // console.log(answerId);
    expect(response.ok).toBeTruthy();
  });
};

function answerData() {
  return [
    // Question 1: Taiwan's Capital City
    {
      user_id: 1,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1120,
    },
    {
      user_id: 2,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1345,
    },
    {
      user_id: 3,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 980,
    },
    {
      user_id: 4,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Tainan",
      answer: null,
      duration: 1530,
    },
    {
      user_id: 5,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1102,
    },
    {
      user_id: 6,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1423,
    },
    {
      user_id: 7,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taidong",
      answer: null,
      duration: 1654,
    },
    {
      user_id: 8,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Tainan",
      answer: null,
      duration: 1280,
    },
    {
      user_id: 9,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1450,
    },
    {
      user_id: 10,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1720,
    },
    {
      user_id: 11,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1210,
    },
    {
      user_id: 12,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1300,
    },
    {
      user_id: 13,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taidong",
      answer: null,
      duration: 1105,
    },
    {
      user_id: 14,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Tainan",
      answer: null,
      duration: 1430,
    },
    {
      user_id: 15,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1355,
    },
    {
      user_id: 16,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1275,
    },
    {
      user_id: 17,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1190,
    },
    {
      user_id: 18,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1405,
    },
    {
      user_id: 19,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taidong",
      answer: null,
      duration: 1325,
    },
    {
      user_id: 20,
      question_id: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1560,
    },

    // Question 2: Taiwan's Tallest Peak
    {
      user_id: 1,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1105,
    },
    {
      user_id: 2,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Alishan",
      answer: null,
      duration: 1225,
    },
    {
      user_id: 3,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1040,
    },
    {
      user_id: 4,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 980,
    },
    {
      user_id: 5,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1130,
    },
    {
      user_id: 6,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1345,
    },
    {
      user_id: 7,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1200,
    },
    {
      user_id: 8,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Alishan",
      answer: null,
      duration: 1180,
    },
    {
      user_id: 9,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1250,
    },
    {
      user_id: 10,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1100,
    },
    {
      user_id: 11,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Alishan",
      answer: null,
      duration: 1210,
    },
    {
      user_id: 12,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1375,
    },
    {
      user_id: 13,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1220,
    },
    {
      user_id: 14,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1185,
    },
    {
      user_id: 15,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1305,
    },
    {
      user_id: 16,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1420,
    },
    {
      user_id: 17,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1275,
    },
    {
      user_id: 18,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1395,
    },
    {
      user_id: 19,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1400,
    },
    {
      user_id: 20,
      question_id: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1435,
    },

    // Question 3: Sky Lantern Festival
    {
      user_id: 1,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1150,
    },
    {
      user_id: 2,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Kenting",
      answer: null,
      duration: 1325,
    },
    {
      user_id: 3,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1200,
    },
    {
      user_id: 4,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Tamsui",
      answer: null,
      duration: 1270,
    },
    {
      user_id: 5,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1330,
    },
    {
      user_id: 6,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1250,
    },
    {
      user_id: 7,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1360,
    },
    {
      user_id: 8,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Kenting",
      answer: null,
      duration: 1240,
    },
    {
      user_id: 9,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Tamsui",
      answer: null,
      duration: 1305,
    },
    {
      user_id: 10,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1125,
    },
    {
      user_id: 11,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1260,
    },
    {
      user_id: 12,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1180,
    },
    {
      user_id: 13,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1375,
    },
    {
      user_id: 14,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Tamsui",
      answer: null,
      duration: 1220,
    },
    {
      user_id: 15,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1165,
    },
    {
      user_id: 16,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1400,
    },
    {
      user_id: 17,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1185,
    },
    {
      user_id: 18,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1335,
    },
    {
      user_id: 19,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1205,
    },
    {
      user_id: 20,
      question_id: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Kenting",
      answer: null,
      duration: 1290,
    },

    // Question 4: Taiwan’s Indigenous Languages
    {
      user_id: 1,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1230,
    },
    {
      user_id: 2,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1210,
    },
    {
      user_id: 3,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1160,
    },
    {
      user_id: 4,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1195,
    },
    {
      user_id: 5,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1235,
    },
    {
      user_id: 6,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1270,
    },
    {
      user_id: 7,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1200,
    },
    {
      user_id: 8,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1295,
    },
    {
      user_id: 9,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1185,
    },
    {
      user_id: 10,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1220,
    },
    {
      user_id: 11,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 845,
    },
    {
      user_id: 12,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austro-Asiatic",
      answer: null,
      duration: 765,
    },
    {
      user_id: 13,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Sino-Tibetan",
      answer: null,
      duration: 812,
    },
    {
      user_id: 14,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 932,
    },
    {
      user_id: 15,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austro-Asiatic",
      answer: null,
      duration: 984,
    },
    {
      user_id: 16,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 756,
    },
    {
      user_id: 17,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Sino-Tibetan",
      answer: null,
      duration: 821,
    },
    {
      user_id: 18,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 794,
    },
    {
      user_id: 19,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Min",
      answer: null,
      duration: 887,
    },
    {
      user_id: 20,
      question_id: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 904,
    },

    // Question 5: Temple Culture in Taiwan
    {
      user_id: 1,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1145,
    },
    {
      user_id: 2,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1250,
    },
    {
      user_id: 3,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1195,
    },
    {
      user_id: 4,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1220,
    },
    {
      user_id: 5,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1160,
    },
    {
      user_id: 6,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1280,
    },
    {
      user_id: 7,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1310,
    },
    {
      user_id: 8,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1200,
    },
    {
      user_id: 9,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1265,
    },
    {
      user_id: 10,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1180,
    },
    {
      user_id: 11,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1275,
    },
    {
      user_id: 12,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1290,
    },
    {
      user_id: 13,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1165,
    },
    {
      user_id: 14,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1245,
    },
    {
      user_id: 15,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1215,
    },
    {
      user_id: 16,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1340,
    },
    {
      user_id: 17,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1280,
    },
    {
      user_id: 18,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1300,
    },
    {
      user_id: 19,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1190,
    },
    {
      user_id: 20,
      question_id: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1320,
    },

    // Question 6: Language of Taiwan

    { user_id: 1, question_id: 6, question: "What is the official language of Taiwan?", option: null, answer: "Mandarin Chinese", duration: 578 },
    {
      user_id: 2,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Mandarin, but a lot of people also speak Taiwanese.",
      duration: 432,
    },
    {
      user_id: 3,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I think it's Mandarin? Not sure if Taiwanese counts.",
      duration: 587,
    },
    {
      user_id: 4,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Taiwanese? Or maybe Mandarin?",
      duration: 501,
    },
    {
      user_id: 5,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Pretty sure it's Chinese, but which kind... Mandarin?",
      duration: 468,
    },
    {
      user_id: 6,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Officially Mandarin, but people speak different languages.",
      duration: 512,
    },
    {
      user_id: 7,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Isn't it Taiwanese? Or is that just a dialect?",
      duration: 462,
    },
    {
      user_id: 8,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I thought it was Japanese a long time ago?",
      duration: 589,
    },
    {
      user_id: 9,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Mandarin, but Hokkien and Hakka are also common.",
      duration: 537,
    },
    {
      user_id: 10,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "No idea, but people here seem to speak Mandarin.",
      duration: 560,
    },
    {
      user_id: 11,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "It should be Mandarin, right?",
      duration: 481,
    },
    {
      user_id: 12,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Some kind of Chinese, but I’m not sure which one.",
      duration: 453,
    },
    {
      user_id: 13,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I guess it’s Mandarin, but I hear people speaking other things too.",
      duration: 490,
    },
    {
      user_id: 14,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Either Mandarin or Taiwanese… not sure which is official.",
      duration: 532,
    },
    {
      user_id: 15,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Mandarin? But I heard older people speaking something else.",
      duration: 477,
    },
    {
      user_id: 16,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I always thought it was Hokkien, but I could be wrong.",
      duration: 509,
    },
    {
      user_id: 17,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Isn't it just Chinese? Wait, is Mandarin different from Chinese?",
      duration: 523,
    },
    {
      user_id: 18,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I think it’s Mandarin, but does English count?",
      duration: 487,
    },
    {
      user_id: 19,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Maybe it's a mix of Mandarin and other local languages?",
      duration: 472,
    },
    {
      user_id: 20,
      question_id: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Not sure… Taiwanese sounds like a language, but Mandarin is spoken more.",
      duration: 495,
    },
  ];
}

module.exports = { createAnswer };
