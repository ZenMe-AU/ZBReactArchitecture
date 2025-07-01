require("dotenv").config(); // Load environment variables

//npm run test:local testSearchLocationAttribute
//npm run test:prod testUserSearch2

// test.todo("Testing User Search with BASE_URL=" + process.env.BASE_URL);
const baseUrl = process.env.QUESTION_URL || "http://localhost:7071";
const profileBaseUrl = process.env.PROFILE_URL || "http://localhost:7072";
const questionUrl = new URL("/question", baseUrl);
const profileUrl = new URL("/profile", profileBaseUrl);
const loginUrl = new URL("/auth/login", profileBaseUrl);

// beforeAll(async () => {
//   }, 60000);

describe("test question data", () => {
  test.each(createUserData())("create User $userId", async (u) => {
    const response = await fetch(profileUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "user" + u.userId,
        avatar: u.avatar,
        attributes: u.attributes,
      }),
    });

    let profile = await response.json();
    let profileId = profile.return.id;
    profileIdLookup.add(u.userId, profileId);

    expect(response.ok).toBeTruthy();
  });
  test.each(questionData())("create question $questionId", async (q) => {
    const response = await fetch(questionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profileIdLookup.getProfileId(q.userId),
        title: q.title,
        questionText: q.question,
        option: q.option,
      }),
    });

    let question = await response.json();
    let questionId = question.return.id;
    questionIdLookup.add(q.questionId, questionId);

    expect(response.ok).toBeTruthy();
  });

  test.each(answerData())("answer question $questionId by user $userId", async (a) => {
    const response = await fetch(questionUrl + "/" + questionIdLookup.getQuestionId(a.questionId) + "/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profileIdLookup.getProfileId(a.userId),
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

  test.each(getQuestionTestResult())("There should be $count questions by user $userId.", async (r) => {
    const response = await fetch(baseUrl + "/profile/" + profileIdLookup.getProfileId(r.userId) + "/question", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const resultData = await response.json();
    const qty = resultData.return.list.length;
    expect(qty).toBe(r.count);
  });

  test.each(getAnswerTestResult())("There should be $count answers for question $questionId.", async (r) => {
    if (!tokenLookup.getToken(r.userId)) {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          userId: profileIdLookup.getProfileId(r.userId),
        }),
      });
      const resultData = await response.json();
      tokenLookup.add(r.userId, resultData.return.token);
    }
    const response = await fetch(questionUrl + "/" + questionIdLookup.getQuestionId(r.questionId) + "/answer", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + tokenLookup.getToken(r.userId),
        "Access-Control-Allow-Origin": "*",
      },
    });
    const resultData = await response.json();
    const qty = resultData.return.list.length;
    expect(qty).toBe(r.count);
  });
});

function createUserData() {
  return [
    {
      userId: 1,
      avatar: "pic/avatar_1.jpg",
      attributes: [],
    },
    {
      userId: 2,
      avatar: "pic/avatar_2.jpg",
      attributes: [],
    },
    {
      userId: 3,
      avatar: "pic/avatar_3.jpg",
      attributes: [],
    },
    {
      userId: 4,
      avatar: "pic/avatar_4.jpg",
      attributes: [],
    },
    {
      userId: 5,
      avatar: "pic/avatar_5.jpg",
      attributes: [],
    },
    {
      userId: 6,
      avatar: "pic/avatar_6.jpg",
      attributes: [],
    },
    {
      userId: 7,
      avatar: "pic/avatar_7.jpg",
      attributes: [],
    },
    {
      userId: 8,
      avatar: "pic/avatar_8.jpg",
      attributes: [],
    },
    {
      userId: 9,
      avatar: "pic/avatar_9.jpg",
      attributes: [],
    },
    {
      userId: 10,
      avatar: "pic/avatar_10.jpg",
      attributes: [],
    },
    {
      userId: 11,
      avatar: "pic/avatar_11.jpg",
      attributes: [],
    },
    {
      userId: 12,
      avatar: "pic/avatar_12.jpg",
      attributes: [],
    },
    {
      userId: 13,
      avatar: "pic/avatar_13.jpg",
      attributes: [],
    },
    {
      userId: 14,
      avatar: "pic/avatar_14.jpg",
      attributes: [],
    },
    {
      userId: 15,
      avatar: "pic/avatar_15.jpg",
      attributes: [],
    },
    {
      userId: 16,
      avatar: "pic/avatar_16.jpg",
      attributes: [],
    },
    {
      userId: 17,
      avatar: "pic/avatar_17.jpg",
      attributes: [],
    },
    {
      userId: 18,
      avatar: "pic/avatar_18.jpg",
      attributes: [],
    },
    {
      userId: 19,
      avatar: "pic/avatar_19.jpg",
      attributes: [],
    },
    {
      userId: 20,
      avatar: "pic/avatar_20.jpg",
      attributes: [],
    },
  ];
}

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

function answerData() {
  return [
    // Question 1: Taiwan's Capital City
    {
      userId: 1,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1120,
    },
    {
      userId: 2,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1345,
    },
    {
      userId: 3,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 980,
    },
    {
      userId: 4,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Tainan",
      answer: null,
      duration: 1530,
    },
    {
      userId: 5,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1102,
    },
    {
      userId: 6,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1423,
    },
    {
      userId: 7,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taidong",
      answer: null,
      duration: 1654,
    },
    {
      userId: 8,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Tainan",
      answer: null,
      duration: 1280,
    },
    {
      userId: 9,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1450,
    },
    {
      userId: 10,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1720,
    },
    {
      userId: 11,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1210,
    },
    {
      userId: 12,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1300,
    },
    {
      userId: 13,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taidong",
      answer: null,
      duration: 1105,
    },
    {
      userId: 14,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Tainan",
      answer: null,
      duration: 1430,
    },
    {
      userId: 15,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1355,
    },
    {
      userId: 16,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1275,
    },
    {
      userId: 17,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1190,
    },
    {
      userId: 18,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taichung",
      answer: null,
      duration: 1405,
    },
    {
      userId: 19,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taidong",
      answer: null,
      duration: 1325,
    },
    {
      userId: 20,
      questionId: 1,
      question: "The capital city is situated in the north. What is it called?",
      option: "Taipei",
      answer: null,
      duration: 1560,
    },

    // Question 2: Taiwan's Tallest Peak
    {
      userId: 1,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1105,
    },
    {
      userId: 2,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Alishan",
      answer: null,
      duration: 1225,
    },
    {
      userId: 3,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1040,
    },
    {
      userId: 4,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 980,
    },
    {
      userId: 5,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1130,
    },
    {
      userId: 6,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1345,
    },
    {
      userId: 7,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1200,
    },
    {
      userId: 8,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Alishan",
      answer: null,
      duration: 1180,
    },
    {
      userId: 9,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1250,
    },
    {
      userId: 10,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1100,
    },
    {
      userId: 11,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Alishan",
      answer: null,
      duration: 1210,
    },
    {
      userId: 12,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1375,
    },
    {
      userId: 13,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1220,
    },
    {
      userId: 14,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1185,
    },
    {
      userId: 15,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1305,
    },
    {
      userId: 16,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1420,
    },
    {
      userId: 17,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1275,
    },
    {
      userId: 18,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1395,
    },
    {
      userId: 19,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1400,
    },
    {
      userId: 20,
      questionId: 2,
      question:
        "Taiwan is the island with the highest mountain density in the world, with 268 peaks over 3,000 meters. What is the highest peak, meaning 'Jade Mountain,' in Taiwan at 3,952 meters?",
      option: "Yushan",
      answer: null,
      duration: 1435,
    },

    // Question 3: Sky Lantern Festival
    {
      userId: 1,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1150,
    },
    {
      userId: 2,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Kenting",
      answer: null,
      duration: 1325,
    },
    {
      userId: 3,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1200,
    },
    {
      userId: 4,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Tamsui",
      answer: null,
      duration: 1270,
    },
    {
      userId: 5,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1330,
    },
    {
      userId: 6,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1250,
    },
    {
      userId: 7,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1360,
    },
    {
      userId: 8,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Kenting",
      answer: null,
      duration: 1240,
    },
    {
      userId: 9,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Tamsui",
      answer: null,
      duration: 1305,
    },
    {
      userId: 10,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1125,
    },
    {
      userId: 11,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1260,
    },
    {
      userId: 12,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1180,
    },
    {
      userId: 13,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1375,
    },
    {
      userId: 14,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Tamsui",
      answer: null,
      duration: 1220,
    },
    {
      userId: 15,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1165,
    },
    {
      userId: 16,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1400,
    },
    {
      userId: 17,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1185,
    },
    {
      userId: 18,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1335,
    },
    {
      userId: 19,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Pingxi",
      answer: null,
      duration: 1205,
    },
    {
      userId: 20,
      questionId: 3,
      question:
        "Which town in Taiwan is famous for its sky lantern festival, where people write wishes on lanterns and release them into the night sky?",
      option: "Kenting",
      answer: null,
      duration: 1290,
    },

    // Question 4: Taiwan’s Indigenous Languages
    {
      userId: 1,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1230,
    },
    {
      userId: 2,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1210,
    },
    {
      userId: 3,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1160,
    },
    {
      userId: 4,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1195,
    },
    {
      userId: 5,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1235,
    },
    {
      userId: 6,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1270,
    },
    {
      userId: 7,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1200,
    },
    {
      userId: 8,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1295,
    },
    {
      userId: 9,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1185,
    },
    {
      userId: 10,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 1220,
    },
    {
      userId: 11,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 845,
    },
    {
      userId: 12,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austro-Asiatic",
      answer: null,
      duration: 765,
    },
    {
      userId: 13,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Sino-Tibetan",
      answer: null,
      duration: 812,
    },
    {
      userId: 14,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 932,
    },
    {
      userId: 15,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austro-Asiatic",
      answer: null,
      duration: 984,
    },
    {
      userId: 16,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 756,
    },
    {
      userId: 17,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Sino-Tibetan",
      answer: null,
      duration: 821,
    },
    {
      userId: 18,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 794,
    },
    {
      userId: 19,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Min",
      answer: null,
      duration: 887,
    },
    {
      userId: 20,
      questionId: 4,
      question:
        "Taiwan is home to 16 officially recognized indigenous groups. But did you know that their languages belong to a single language family that stretches all the way from Taiwan to the Philippines, Hawaii, New Zealand, and even Madagascar? Which language family do Taiwan’s indigenous languages belong to?",
      option: "Austronesian",
      answer: null,
      duration: 904,
    },

    // Question 5: Temple Culture in Taiwan
    {
      userId: 1,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1145,
    },
    {
      userId: 2,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1250,
    },
    {
      userId: 3,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1195,
    },
    {
      userId: 4,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1220,
    },
    {
      userId: 5,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1160,
    },
    {
      userId: 6,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1280,
    },
    {
      userId: 7,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1310,
    },
    {
      userId: 8,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1200,
    },
    {
      userId: 9,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1265,
    },
    {
      userId: 10,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1180,
    },
    {
      userId: 11,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1275,
    },
    {
      userId: 12,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1290,
    },
    {
      userId: 13,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1165,
    },
    {
      userId: 14,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Guanyin",
      answer: null,
      duration: 1245,
    },
    {
      userId: 15,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1215,
    },
    {
      userId: 16,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1340,
    },
    {
      userId: 17,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1280,
    },
    {
      userId: 18,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1300,
    },
    {
      userId: 19,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1190,
    },
    {
      userId: 20,
      questionId: 5,
      question: "Which sea goddess is the most widely worshiped deity in Taiwan, with hundreds of temples dedicated to her?",
      option: "Mazu",
      answer: null,
      duration: 1320,
    },

    // Question 6: Language of Taiwan

    { userId: 1, questionId: 6, question: "What is the official language of Taiwan?", option: null, answer: "Mandarin Chinese", duration: 578 },
    {
      userId: 2,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Mandarin, but a lot of people also speak Taiwanese.",
      duration: 432,
    },
    {
      userId: 3,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I think it's Mandarin? Not sure if Taiwanese counts.",
      duration: 587,
    },
    {
      userId: 4,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Taiwanese? Or maybe Mandarin?",
      duration: 501,
    },
    {
      userId: 5,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Pretty sure it's Chinese, but which kind... Mandarin?",
      duration: 468,
    },
    {
      userId: 6,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Officially Mandarin, but people speak different languages.",
      duration: 512,
    },
    {
      userId: 7,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Isn't it Taiwanese? Or is that just a dialect?",
      duration: 462,
    },
    {
      userId: 8,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I thought it was Japanese a long time ago?",
      duration: 589,
    },
    {
      userId: 9,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Mandarin, but Hokkien and Hakka are also common.",
      duration: 537,
    },
    {
      userId: 10,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "No idea, but people here seem to speak Mandarin.",
      duration: 560,
    },
    {
      userId: 11,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "It should be Mandarin, right?",
      duration: 481,
    },
    {
      userId: 12,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Some kind of Chinese, but I’m not sure which one.",
      duration: 453,
    },
    {
      userId: 13,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I guess it’s Mandarin, but I hear people speaking other things too.",
      duration: 490,
    },
    {
      userId: 14,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Either Mandarin or Taiwanese… not sure which is official.",
      duration: 532,
    },
    {
      userId: 15,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Mandarin? But I heard older people speaking something else.",
      duration: 477,
    },
    {
      userId: 16,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I always thought it was Hokkien, but I could be wrong.",
      duration: 509,
    },
    {
      userId: 17,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Isn't it just Chinese? Wait, is Mandarin different from Chinese?",
      duration: 523,
    },
    {
      userId: 18,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "I think it’s Mandarin, but does English count?",
      duration: 487,
    },
    {
      userId: 19,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Maybe it's a mix of Mandarin and other local languages?",
      duration: 472,
    },
    {
      userId: 20,
      questionId: 6,
      question: "What is the official language of Taiwan?",
      option: null,
      answer: "Not sure… Taiwanese sounds like a language, but Mandarin is spoken more.",
      duration: 495,
    },
  ];
}

function getQuestionTestResult() {
  return [
    {
      userId: 1,
      count: 6,
    },
  ];
}

function getAnswerTestResult() {
  return [
    {
      userId: 1,
      questionId: 1,
      count: 20,
    },
    {
      userId: 1,
      questionId: 2,
      count: 20,
    },
    {
      userId: 1,
      questionId: 3,
      count: 20,
    },
    {
      userId: 1,
      questionId: 4,
      count: 20,
    },
    {
      userId: 1,
      questionId: 5,
      count: 20,
    },
    {
      userId: 1,
      questionId: 6,
      count: 20,
    },
  ];
}

const tokenLookup = {
  data: [],
  add: function (testId, token) {
    this.data.push({
      testId: testId,
      token: token,
    });
  },
  getToken: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.token : null;
  },
};

const profileIdLookup = {
  data: [],
  add: function (testId, profileId) {
    this.data.push({
      testId: testId,
      profileId: profileId,
    });
  },
  getProfileId: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.profileId : null;
  },
};

const questionIdLookup = {
  data: [],
  add: function (testId, questionId) {
    this.data.push({
      testId: testId,
      questionId: questionId,
    });
  },
  getQuestionId: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.questionId : null;
  },
};
