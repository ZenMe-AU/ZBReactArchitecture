const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const profileUrl = new URL("/api/profile", baseUrl);

const createUser = () => {
  test.each(createUserData())("create User $user_id", async (u) => {
    const response = await fetch(profileUrl, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        name: u.name ?? "user" + u.user_id,
        avatar: u.avatar,
        attributes: u.attributes,
      }),
    });

    let profile = await response.json();
    let profileId = profile.return.id;
    profileIdLookup.add(u.user_id, profileId);

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
      user_id: 1,
      avatar: "pic/avatar_1.jpg",
      attributes: [],
    },
    {
      user_id: 2,
      avatar: "pic/avatar_2.jpg",
      attributes: [],
    },
    {
      user_id: 3,
      avatar: "pic/avatar_3.jpg",
      attributes: [],
    },
    {
      user_id: 4,
      avatar: "pic/avatar_4.jpg",
      attributes: [],
    },
    {
      user_id: 5,
      avatar: "pic/avatar_5.jpg",
      attributes: [],
    },
    {
      user_id: 6,
      avatar: "pic/avatar_6.jpg",
      attributes: [],
    },
    {
      user_id: 7,
      avatar: "pic/avatar_7.jpg",
      attributes: [],
    },
    {
      user_id: 8,
      avatar: "pic/avatar_8.jpg",
      attributes: [],
    },
    {
      user_id: 9,
      avatar: "pic/avatar_9.jpg",
      attributes: [],
    },
    {
      user_id: 10,
      avatar: "pic/avatar_10.jpg",
      attributes: [],
    },
    {
      user_id: 11,
      avatar: "pic/avatar_11.jpg",
      attributes: [],
    },
    {
      user_id: 12,
      avatar: "pic/avatar_12.jpg",
      attributes: [],
    },
    {
      user_id: 13,
      avatar: "pic/avatar_13.jpg",
      attributes: [],
    },
    {
      user_id: 14,
      avatar: "pic/avatar_14.jpg",
      attributes: [],
    },
    {
      user_id: 15,
      avatar: "pic/avatar_15.jpg",
      attributes: [],
    },
    {
      user_id: 16,
      avatar: "pic/avatar_16.jpg",
      attributes: [],
    },
    {
      user_id: 17,
      avatar: "pic/avatar_17.jpg",
      attributes: [],
    },
    {
      user_id: 18,
      avatar: "pic/avatar_18.jpg",
      attributes: [],
    },
    {
      user_id: 19,
      avatar: "pic/avatar_19.jpg",
      attributes: [],
    },
    {
      user_id: 20,
      avatar: "pic/avatar_20.jpg",
      attributes: [],
    },
  ];
}

module.exports = { createUser, profileIdLookup };
