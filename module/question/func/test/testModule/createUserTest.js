const baseUrl = process.env.QUESTION_URL || "http://localhost:7071";
const profileBaseUrl = process.env.PROFILE_URL || "http://localhost:7072";
const profileUrl = new URL("/profile", profileBaseUrl);

const createUser = () => {
  test.each(createUserData())("create User $userId", async (u) => {
    const response = await fetch(profileUrl, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        name: u.name ?? "user" + u.userId,
        avatar: u.avatar,
        attributes: u.attributes,
      }),
    });

    let profile = await response.json();
    let profileId = profile.return.id;
    profileIdLookup.add(u.userId, profileId);

    expect(response.ok).toBeTruthy();
  });
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

module.exports = { createUser, profileIdLookup };
