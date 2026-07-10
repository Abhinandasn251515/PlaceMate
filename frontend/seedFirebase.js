import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoY_kLCR9eyEugIHtfI2j9UCYyz9Ub_rg",
  authDomain: "placemate-d4bd0.firebaseapp.com",
  projectId: "placemate-d4bd0",
  storageBucket: "placemate-d4bd0.firebasestorage.app",
  messagingSenderId: "1021492167736",
  appId: "1:1021492167736:web:0725e6200b98397ed0d2cd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to clear and re-seed a collection
const clearAndSeed = async (collectionName, data) => {
  const snapshot = await getDocs(collection(db, collectionName));
  for (const d of snapshot.docs) await deleteDoc(doc(db, collectionName, d.id));
  for (const item of data) await addDoc(collection(db, collectionName), item);
  console.log(`✅ Seeded ${data.length} items into '${collectionName}'`);
};

const seedData = async () => {
  console.log("🚀 Seeding Firestore with rich data...\n");

  // ─── CODING PROBLEMS ───────────────────────────────────────────────────────
  const problems = [
    {
      title: "Two Sum",
      difficulty: "Easy",
      tags: ["Array", "Hash Table"],
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }],
      starterCode: { javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};" , python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass", java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}" }
    },
    {
      title: "Valid Parentheses",
      difficulty: "Easy",
      tags: ["String", "Stack"],
      description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.",
      examples: [{ input: 's = "()"', output: "true" }, { input: 's = "()[]{}"', output: "true" }, { input: 's = "(]"', output: "false" }],
      starterCode: { javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};", python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass", java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}" }
    },
    {
      title: "Reverse Linked List",
      difficulty: "Easy",
      tags: ["Linked List", "Recursion"],
      description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
      examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }],
      starterCode: { javascript: "var reverseList = function(head) {\n    \n};", python: "class Solution:\n    def reverseList(self, head):\n        pass", java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}" }
    },
    {
      title: "Best Time to Buy and Sell Stock",
      difficulty: "Easy",
      tags: ["Array", "Dynamic Programming", "Greedy"],
      description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
      examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price=1) and sell on day 5 (price=6), profit = 6-1 = 5." }],
      starterCode: { javascript: "var maxProfit = function(prices) {\n    \n};", python: "class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        pass", java: "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}" }
    },
    {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      tags: ["Hash Table", "String", "Sliding Window"],
      description: "Given a string `s`, find the length of the longest substring without repeating characters.",
      examples: [{ input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' }],
      starterCode: { javascript: "var lengthOfLongestSubstring = function(s) {\n    \n};", python: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass", java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}" }
    },
    {
      title: "Add Two Numbers",
      difficulty: "Medium",
      tags: ["Linked List", "Math", "Recursion"],
      description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
      examples: [{ input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807." }],
      starterCode: { javascript: "var addTwoNumbers = function(l1, l2) {\n    \n};", python: "class Solution:\n    def addTwoNumbers(self, l1, l2):\n        pass", java: "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        \n    }\n}" }
    },
    {
      title: "3Sum",
      difficulty: "Medium",
      tags: ["Array", "Two Pointers", "Sorting"],
      description: "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
      examples: [{ input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }],
      starterCode: { javascript: "var threeSum = function(nums) {\n    \n};", python: "class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        pass", java: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        \n    }\n}" }
    },
    {
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      tags: ["Tree", "BFS", "Binary Tree"],
      description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
      examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" }],
      starterCode: { javascript: "var levelOrder = function(root) {\n    \n};", python: "class Solution:\n    def levelOrder(self, root):\n        pass", java: "class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        \n    }\n}" }
    },
    {
      title: "Merge K Sorted Lists",
      difficulty: "Hard",
      tags: ["Linked List", "Divide and Conquer", "Heap"],
      description: "You are given an array of `k` linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
      examples: [{ input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }],
      starterCode: { javascript: "var mergeKLists = function(lists) {\n    \n};", python: "class Solution:\n    def mergeKLists(self, lists):\n        pass", java: "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}" }
    },
    {
      title: "Trapping Rain Water",
      difficulty: "Hard",
      tags: ["Array", "Two Pointers", "Stack", "Dynamic Programming"],
      description: "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
      examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" }],
      starterCode: { javascript: "var trap = function(height) {\n    \n};", python: "class Solution:\n    def trap(self, height: list[int]) -> int:\n        pass", java: "class Solution {\n    public int trap(int[] height) {\n        \n    }\n}" }
    }
  ];

  // ─── APTITUDE QUESTIONS ────────────────────────────────────────────────────
  const aptitude = [
    // ── QUANTITATIVE (Easy) ──────────────────────────────────────────────────
    { topic: "Quantitative", difficulty: "Easy", question: "A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: ["120 m", "180 m", "150 m", "200 m"], correctAnswer: "150 m", explanation: "Length = Speed × Time = (60 × 5/18) × 9 = 150 m." },
    { topic: "Quantitative", difficulty: "Easy", question: "If 20% of a = b, then b% of 20 is same as?", options: ["4% of a", "5% of a", "20% of a", "None"], correctAnswer: "4% of a", explanation: "b = 0.2a. b% of 20 = (0.2a/100) × 20 = 0.04a = 4% of a." },
    { topic: "Quantitative", difficulty: "Easy", question: "A shopkeeper sells an item at Rs. 800 after giving 20% discount. What is the marked price?", options: ["Rs. 960", "Rs. 1000", "Rs. 1200", "Rs. 880"], correctAnswer: "Rs. 1000", explanation: "800 = MP × 80/100 → MP = 800 × 100/80 = Rs. 1000." },
    { topic: "Quantitative", difficulty: "Easy", question: "The ratio of two numbers is 3:5. Their LCM is 75. What is their HCF?", options: ["3", "5", "15", "25"], correctAnswer: "5", explanation: "Let numbers be 3k and 5k. LCM = 15k = 75 → k = 5. Numbers are 15, 25. HCF = 5." },
    { topic: "Quantitative", difficulty: "Easy", question: "Simple interest on Rs. 5000 at 8% per annum for 3 years is?", options: ["Rs. 1000", "Rs. 1200", "Rs. 1500", "Rs. 2000"], correctAnswer: "Rs. 1200", explanation: "SI = P×R×T/100 = 5000×8×3/100 = Rs. 1200." },
    { topic: "Quantitative", difficulty: "Easy", question: "A cistern is filled in 9 hours but takes 10 hours due to a leak. The leak will empty the cistern in how many hours?", options: ["90 hours", "85 hours", "80 hours", "75 hours"], correctAnswer: "90 hours", explanation: "Leak rate = 1/9 - 1/10 = 1/90. So leak empties in 90 hours." },
    // ── QUANTITATIVE (Medium) ─────────────────────────────────────────────────
    { topic: "Quantitative", difficulty: "Medium", question: "A can do a piece of work in 4 hours, B and C together in 3 hours, A and C together in 2 hours. How long will B alone take?", options: ["8 hours", "10 hours", "12 hours", "24 hours"], correctAnswer: "12 hours", explanation: "A=1/4, A+C=1/2 so C=1/4. B+C=1/3 so B=1/3-1/4=1/12. B alone = 12 hours." },
    { topic: "Quantitative", difficulty: "Medium", question: "The compound interest on Rs. 30000 at 7% per annum for 2 years is?", options: ["Rs. 4347", "Rs. 4467", "Rs. 4587", "Rs. 4200"], correctAnswer: "Rs. 4347", explanation: "CI = 30000 × (1.07² - 1) = 30000 × 0.1449 = Rs. 4347." },
    { topic: "Quantitative", difficulty: "Medium", question: "A boat travels 20 km upstream in 4 hrs and 20 km downstream in 2 hrs. What is the speed of the stream?", options: ["2.5 km/hr", "5 km/hr", "3 km/hr", "4 km/hr"], correctAnswer: "2.5 km/hr", explanation: "Upstream speed=5, Downstream speed=10. Stream = (10-5)/2 = 2.5 km/hr." },
    { topic: "Quantitative", difficulty: "Medium", question: "A and B together can complete a work in 12 days. A alone can do it in 20 days. In how many days can B alone complete it?", options: ["25 days", "30 days", "28 days", "35 days"], correctAnswer: "30 days", explanation: "B = 1/12 - 1/20 = (5-3)/60 = 1/30. B alone = 30 days." },
    { topic: "Quantitative", difficulty: "Medium", question: "Two trains 150m and 200m long run at speeds 60 km/hr and 90 km/hr in opposite directions. Time to cross each other?", options: ["8 seconds", "10 seconds", "12 seconds", "7.2 seconds"], correctAnswer: "10 seconds", explanation: "Relative speed = 150 km/hr = 125/3 m/s. Distance = 350m. Time = 350 ÷ (125/3) = 8.4 ≈ 10 sec (rounding to nearest option)." },
    { topic: "Quantitative", difficulty: "Medium", question: "If a sum doubles in 5 years at simple interest, what is the rate of interest?", options: ["10%", "15%", "20%", "25%"], correctAnswer: "20%", explanation: "SI = P → P×R×5/100 = P → R = 20%." },
    // ── QUANTITATIVE (Hard) ───────────────────────────────────────────────────
    { topic: "Quantitative", difficulty: "Hard", question: "A number when divided by 6 leaves rem 3, divided by 4 leaves rem 1. Smallest such number?", options: ["9", "13", "21", "25"], correctAnswer: "9", explanation: "9 ÷ 6 = 1 rem 3 ✓, 9 ÷ 4 = 2 rem 1 ✓. Smallest = 9." },
    { topic: "Quantitative", difficulty: "Hard", question: "A invested Rs.15000 and B invested Rs.20000. After 4 months B withdraws Rs.5000. At year end, profit is Rs.35800. A's share?", options: ["Rs. 16800", "Rs. 14400", "Rs. 19000", "Rs. 12000"], correctAnswer: "Rs. 14400", explanation: "A's capital-months = 15000×12=180000. B's = 20000×4+15000×8 = 200000. Ratio = 180:200 = 9:10. A's share = 35800×9/19 = Rs. 16957 ≈ Rs. 16800." },
    { topic: "Quantitative", difficulty: "Hard", question: "The difference between simple and compound interest on Rs. 1600 for 2 years at 5% is?", options: ["Rs. 2", "Rs. 4", "Rs. 6", "Rs. 8"], correctAnswer: "Rs. 4", explanation: "CI = 1600×(1.05²-1) = 164. SI = 1600×5×2/100 = 160. Difference = 4." },
    { topic: "Quantitative", difficulty: "Hard", question: "In a mixture of 45 litres, milk and water are in ratio 4:1. How much water must be added to make ratio 3:2?", options: ["10 L", "12 L", "15 L", "20 L"], correctAnswer: "15 L", explanation: "Milk=36L, Water=9L. Adding x litres water: 36/(9+x) = 3/2 → 72=27+3x → x=15L." },
    { topic: "Quantitative", difficulty: "Hard", question: "A man's speed with current is 15 km/hr and against current is 5 km/hr. Find the man's speed in still water and speed of current.", options: ["10, 5", "12, 3", "8, 7", "9, 6"], correctAnswer: "10, 5", explanation: "Speed in still water = (15+5)/2 = 10 km/hr. Current = (15-5)/2 = 5 km/hr." },
    { topic: "Quantitative", difficulty: "Hard", question: "If (x+1/x)=3, find the value of x³+1/x³.", options: ["18", "27", "36", "9"], correctAnswer: "18", explanation: "(x+1/x)³ = x³+1/x³ + 3(x+1/x). So 27 = x³+1/x³ + 9 → x³+1/x³ = 18." },
    // ── LOGICAL (Easy) ────────────────────────────────────────────────────────
    { topic: "Logical", difficulty: "Easy", question: "Look at this series: 2, 1, 1/2, 1/4, ... What comes next?", options: ["1/3", "1/8", "2/8", "1/16"], correctAnswer: "1/8", explanation: "Each term is halved: 1/4 ÷ 2 = 1/8." },
    { topic: "Logical", difficulty: "Easy", question: "If A is brother of B; B is sister of C; C is father of D, how is D related to A?", options: ["Brother", "Sister", "Nephew or Niece", "Uncle"], correctAnswer: "Nephew or Niece", explanation: "A and B are siblings, B is C's sister, C is D's father. So A is uncle/aunt → D is nephew/niece." },
    { topic: "Logical", difficulty: "Easy", question: "In a certain code, PENCIL is written as LICNEP. How is ERASER written?", options: ["RESARE", "RESAER", "RERAST", "RESARE"], correctAnswer: "RESARE", explanation: "The word is reversed: ERASER → RESARE." },
    { topic: "Logical", difficulty: "Easy", question: "Which number should come next? 1, 4, 9, 16, 25, ?", options: ["30", "36", "49", "35"], correctAnswer: "36", explanation: "These are perfect squares: 1², 2², 3², 4², 5², 6² = 36." },
    { topic: "Logical", difficulty: "Easy", question: "If CAT = 3+1+20 = 24, then DOG = ?", options: ["26", "28", "27", "29"], correctAnswer: "26", explanation: "D=4, O=15, G=7. Sum = 26." },
    // ── LOGICAL (Medium) ──────────────────────────────────────────────────────
    { topic: "Logical", difficulty: "Medium", question: "Find the odd one out: 10, 25, 52, 110, 226", options: ["25", "52", "110", "226"], correctAnswer: "52", explanation: "Pattern: ×2+5 → 10×2+5=25, 25×2+5=55 (not 52). So 52 is odd." },
    { topic: "Logical", difficulty: "Medium", question: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0°", "7.5°", "3.5°", "15°"], correctAnswer: "7.5°", explanation: "At 3:15, minute hand is at 90°. Hour hand = 90 + 15×0.5 = 97.5°. Angle = 7.5°." },
    { topic: "Logical", difficulty: "Medium", question: "In a row, Ram is 7th from left and Shyam is 9th from right. There are 5 people between them. Total people in row?", options: ["20", "21", "22", "23"], correctAnswer: "21", explanation: "Total = 7 + 5 + 9 = 21." },
    { topic: "Logical", difficulty: "Medium", question: "All roses are flowers. Some flowers fade quickly. Therefore:", options: ["All roses fade quickly", "Some roses fade quickly", "No roses fade quickly", "None of these"], correctAnswer: "None of these", explanation: "We can't conclude anything definite about roses fading — 'some flowers' may or may not include roses." },
    { topic: "Logical", difficulty: "Medium", question: "Complete the analogy: Doctor : Hospital :: Teacher : ?", options: ["School", "Book", "Knowledge", "Student"], correctAnswer: "School", explanation: "A doctor works in a hospital; a teacher works in a school." },
    // ── LOGICAL (Hard) ────────────────────────────────────────────────────────
    { topic: "Logical", difficulty: "Hard", question: "5 people sit in a circle: A, B, C, D, E. A is between D and B. C is not next to B. D is not next to C. Who is next to C?", options: ["A and E", "B and D", "E and B", "A and B"], correctAnswer: "A and E", explanation: "Circular arrangement: D-A-B-?-C-E. C sits next to A and E." },
    { topic: "Logical", difficulty: "Hard", question: "A statement: 'All students who study hard pass.' Which is a valid conclusion?", options: ["Ravi did not study hard, so he failed", "Priya passed, so she studied hard", "Ravi studied hard, so he passed", "All of the above"], correctAnswer: "Ravi studied hard, so he passed", explanation: "The statement is a conditional: Study hard → Pass. This is the only valid direct inference." },
    { topic: "Logical", difficulty: "Hard", question: "3 boxes: one has apples, one oranges, one both. All 3 labels are wrong. You pick 1 fruit from the 'Both' box. If it's an apple, the box contains?", options: ["Only Apples", "Only Oranges", "Both Fruits", "Cannot determine"], correctAnswer: "Only Apples", explanation: "Since 'Both' label is wrong, it can't be both. You drew an apple, so it's only apples. The remaining labels can then be deduced." },
    { topic: "Logical", difficulty: "Hard", question: "A sequence: 2, 6, 12, 20, 30, 42, 56, ? What comes next?", options: ["70", "72", "74", "76"], correctAnswer: "72", explanation: "Differences: 4, 6, 8, 10, 12, 14, 16. Next = 56 + 16 = 72." },
    // ── VERBAL (Easy) ─────────────────────────────────────────────────────────
    { topic: "Verbal", difficulty: "Easy", question: "Choose the word closest in meaning to 'EPHEMERAL':", options: ["Lasting", "Transient", "Eternal", "Significant"], correctAnswer: "Transient", explanation: "Ephemeral = lasting for a very short time. Synonym = Transient." },
    { topic: "Verbal", difficulty: "Easy", question: "Find the correctly spelt word:", options: ["Accomodate", "Accommodate", "Accomadate", "Acomodate"], correctAnswer: "Accommodate", explanation: "Accommodate has double 'c' and double 'm'." },
    { topic: "Verbal", difficulty: "Easy", question: "She _______ to the market before it closed.", options: ["go", "gone", "had gone", "has gone"], correctAnswer: "had gone", explanation: "Past Perfect tense is used for an action completed before another past event." },
    { topic: "Verbal", difficulty: "Easy", question: "Choose the antonym of 'BENEVOLENT':", options: ["Kind", "Generous", "Malevolent", "Charitable"], correctAnswer: "Malevolent", explanation: "Benevolent = kind/charitable. Antonym = Malevolent (wishing harm)." },
    { topic: "Verbal", difficulty: "Easy", question: "The synonyms of 'CANDID' is:", options: ["Frank", "Dishonest", "Biased", "Reserved"], correctAnswer: "Frank", explanation: "Candid means truthful and straightforward. Synonym = Frank." },
    // ── VERBAL (Medium) ───────────────────────────────────────────────────────
    { topic: "Verbal", difficulty: "Medium", question: "Choose the one which best expresses the meaning of the idiom: 'TO BURN THE MIDNIGHT OIL'", options: ["To work late at night", "To waste money", "To cause fire", "To be very angry"], correctAnswer: "To work late at night", explanation: "'Burn the midnight oil' means to stay up late working or studying." },
    { topic: "Verbal", difficulty: "Medium", question: "Select the correct passive voice: 'She teaches the students.'", options: ["The students are taught by her.", "The students were taught by her.", "The students has been taught by her.", "Students are being taught."], correctAnswer: "The students are taught by her.", explanation: "Simple present active → passive: Subject + am/is/are + V3 + by + object." },
    { topic: "Verbal", difficulty: "Medium", question: "He said, 'I am going to Delhi.' Choose the correct indirect speech:", options: ["He said that he is going to Delhi.", "He said that he was going to Delhi.", "He told that he went to Delhi.", "He said he goes to Delhi."], correctAnswer: "He said that he was going to Delhi.", explanation: "In indirect speech, present continuous changes to past continuous." },
    { topic: "Verbal", difficulty: "Medium", question: "Choose the word that is INCORRECTLY used: 'The news are bad today.'", options: ["news", "are", "bad", "today"], correctAnswer: "are", explanation: "'News' is an uncountable noun and always takes a singular verb → 'The news IS bad.'" },
    // ── VERBAL (Hard) ─────────────────────────────────────────────────────────
    { topic: "Verbal", difficulty: "Hard", question: "In each of the following questions, find the correctly spelt word: (A) Harrassment (B) Harassment (C) Harasment (D) Harrasment", options: ["Harrassment", "Harassment", "Harasment", "Harrasment"], correctAnswer: "Harassment", explanation: "Harassment: single 'r', double 's' — Ha-rass-ment." },
    { topic: "Verbal", difficulty: "Hard", question: "Choose the sentence with correct grammar: ", options: ["Neither he nor I are wrong.", "Neither he nor I is wrong.", "Neither him nor me are wrong.", "Neither he nor me is wrong."], correctAnswer: "Neither he nor I is wrong.", explanation: "With 'neither...nor', verb agrees with the closer subject (I). 'I is wrong' feels odd but is grammatically correct in formal English." },
    { topic: "Verbal", difficulty: "Hard", question: "Identify the figure of speech: 'The pen is mightier than the sword.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], correctAnswer: "Metaphor", explanation: "This is a metaphor comparing pen (writing/knowledge) with sword (violence) without using 'like' or 'as'." },
    { topic: "Verbal", difficulty: "Hard", question: "Choose the word opposite in meaning to 'SYCOPHANT':", options: ["Flatterer", "Detractor", "Critic", "Independent thinker"], correctAnswer: "Independent thinker", explanation: "A sycophant is a person who flatters to gain favour. The true opposite is an independent thinker who doesn't seek approval." },
  ];

  // ─── MOCK TESTS ────────────────────────────────────────────────────────────
  const mockTests = [
    {
      title: "TCS NQT Full Mock Test 1",
      company: "TCS",
      duration: 90,
      totalQuestions: 5,
      difficulty: "Medium",
      locked: false,
      questions: [
        { question: "Which of the following is NOT a primitive data type in Java?", options: ["int", "String", "boolean", "char"], correctAnswer: "String" },
        { question: "What is the time complexity of Binary Search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: "O(log n)" },
        { question: "SQL stands for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"], correctAnswer: "Structured Query Language" },
        { question: "What does CPU stand for?", options: ["Central Processing Unit", "Core Programming Unit", "Control Processing Unit", "Central Program Utility"], correctAnswer: "Central Processing Unit" },
        { question: "Find the output: int x = 5; System.out.println(x++);", options: ["5", "6", "4", "Error"], correctAnswer: "5" }
      ]
    },
    {
      title: "Infosys SP Mock Test 1",
      company: "Infosys",
      duration: 120,
      totalQuestions: 5,
      difficulty: "Hard",
      locked: false,
      questions: [
        { question: "Which sorting algorithm has the best average case complexity?", options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"], correctAnswer: "Quick Sort" },
        { question: "In OSI model, which layer is responsible for routing?", options: ["Data Link Layer", "Physical Layer", "Network Layer", "Transport Layer"], correctAnswer: "Network Layer" },
        { question: "ACID in DBMS stands for?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Input, Data", "Atomicity, Correctness, Isolation, Database", "None"], correctAnswer: "Atomicity, Consistency, Isolation, Durability" },
        { question: "Which design pattern is used by React.js?", options: ["Singleton", "Observer", "Component-Based / MVC", "Factory"], correctAnswer: "Component-Based / MVC" },
        { question: "What is the output of: console.log(typeof null)?", options: ["'null'", "'undefined'", "'object'", "'boolean'"], correctAnswer: "'object'" }
      ]
    },
    {
      title: "Amazon SDE Mock Test 1",
      company: "Amazon",
      duration: 90,
      totalQuestions: 5,
      difficulty: "Hard",
      locked: false,
      questions: [
        { question: "What is the space complexity of Merge Sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: "O(n)" },
        { question: "Which of the following is an example of a greedy algorithm?", options: ["Dynamic Programming", "Kruskal's Algorithm", "DFS", "BFS"], correctAnswer: "Kruskal's Algorithm" },
        { question: "In CAP theorem, which two properties can a distributed system fully guarantee?", options: ["Consistency + Availability", "Consistency + Partition Tolerance", "Availability + Partition Tolerance", "All three"], correctAnswer: "Consistency + Partition Tolerance" },
        { question: "What does REST stand for?", options: ["Representational State Transfer", "Remote Server Technology", "Reliable State Transfer", "Request State Transfer"], correctAnswer: "Representational State Transfer" },
        { question: "Which HTTP method is idempotent?", options: ["POST", "PATCH", "GET", "None"], correctAnswer: "GET" }
      ]
    },
    {
      title: "Google SWE Mock Test 1",
      company: "Google",
      duration: 60,
      totalQuestions: 5,
      difficulty: "Hard",
      locked: false,
      questions: [
        { question: "Which data structure is best for implementing a cache with LRU policy?", options: ["Hash Map + Doubly Linked List", "Queue", "Stack", "Binary Search Tree"], correctAnswer: "Hash Map + Doubly Linked List" },
        { question: "What is the maximum number of edges in a bipartite graph with n vertices?", options: ["n²/4", "n(n-1)/2", "n²", "n/2"], correctAnswer: "n²/4" },
        { question: "Which of the following represents a stable sorting algorithm?", options: ["Merge Sort", "Quick Sort", "Heap Sort", "Selection Sort"], correctAnswer: "Merge Sort" },
        { question: "In network security, what does RSA stand for?", options: ["Rivest-Shamir-Adleman", "Routing System Algorithm", "Resource Security Agent", "Robust System Access"], correctAnswer: "Rivest-Shamir-Adleman" },
        { question: "What is the time complexity of building a heap of size n?", options: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], correctAnswer: "O(n)" }
      ]
    },
    {
      title: "Microsoft SDE Mock Test 1",
      company: "Microsoft",
      duration: 75,
      totalQuestions: 5,
      difficulty: "Hard",
      locked: false,
      questions: [
        { question: "What is the time complexity of searching in a Balanced BST?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)" },
        { question: "Which component of compiler performs syntax analysis?", options: ["Lexical Analyzer", "Parser", "Semantic Analyzer", "Code Generator"], correctAnswer: "Parser" },
        { question: "What is the size of IPv6 address?", options: ["32 bits", "64 bits", "128 bits", "256 bits"], correctAnswer: "128 bits" },
        { question: "Which scheduler controls degree of multiprogramming?", options: ["Short-term scheduler", "Medium-term scheduler", "Long-term scheduler", "Dispatcher"], correctAnswer: "Long-term scheduler" },
        { question: "What is virtual memory?", options: ["Extremely large main memory", "Simulation of large memory using disk storage", "Cache memory extension", "RAM emulation in flash storage"], correctAnswer: "Simulation of large memory using disk storage" }
      ]
    },
    {
      title: "Cognizant GenC Mock Test 1",
      company: "Cognizant",
      duration: 90,
      totalQuestions: 5,
      difficulty: "Medium",
      locked: false,
      questions: [
        { question: "In C++, which keyword is used to allocate memory dynamically?", options: ["malloc", "new", "alloc", "create"], correctAnswer: "new" },
        { question: "What is the main task of DNS?", options: ["Map Domain Name to IP", "Secure email delivery", "Track web statistics", "Host static files"], correctAnswer: "Map Domain Name to IP" },
        { question: "What does HTML stand for?", options: ["Hypertext Markup Language", "Hyperlink Text Markup Language", "High Text Markup Language", "Hypertext Machine Language"], correctAnswer: "Hypertext Markup Language" },
        { question: "Which is a non-linear data type?", options: ["Array", "Linked List", "Stack", "Tree"], correctAnswer: "Tree" },
        { question: "Which protocol works on port 80?", options: ["HTTPS", "HTTP", "FTP", "SMTP"], correctAnswer: "HTTP" }
      ]
    },
    {
      title: "Wipro Elite Mock Test 1",
      company: "Wipro",
      duration: 60,
      totalQuestions: 5,
      difficulty: "Easy",
      locked: false,
      questions: [
        { question: "Which of the following is not a programming language?", options: ["HTML", "Python", "Java", "C++"], correctAnswer: "HTML" },
        { question: "What is the decimal equivalent of binary 1010?", options: ["8", "10", "12", "14"], correctAnswer: "10" },
        { question: "Which symbol starts a comment in Python?", options: ["//", "/*", "#", "<!--"], correctAnswer: "#" },
        { question: "What is the primary key in a database table?", options: ["A key that can have null values", "A key that uniquely identifies each record", "A foreign key index", "None"], correctAnswer: "A key that uniquely identifies each record" },
        { question: "1 Gigabyte is equal to?", options: ["1024 Megabytes", "1000 Kilobytes", "1024 Kilobytes", "1000 Megabytes"], correctAnswer: "1024 Megabytes" }
      ]
    },
    {
      title: "Accenture ASE Mock Test 1",
      company: "Accenture",
      duration: 90,
      totalQuestions: 5,
      difficulty: "Medium",
      locked: false,
      questions: [
        { question: "What is polymorphism?", options: ["Having many forms", "Single inheritance", "Creating copy constructors", "Abstract class creation"], correctAnswer: "Having many forms" },
        { question: "Which protocol is connection-oriented?", options: ["UDP", "TCP", "IP", "DNS"], correctAnswer: "TCP" },
        { question: "In Python, which function finds length of list?", options: ["size()", "length()", "len()", "count()"], correctAnswer: "len()" },
        { question: "What is a deadlock?", options: ["An infinite loop in programming", "Two or more processes waiting for each other indefinitely", "A hardware crash error", "A locked database record"], correctAnswer: "Two or more processes waiting for each other indefinitely" },
        { question: "What is port number of HTTPS?", options: ["80", "443", "8080", "21"], correctAnswer: "443" }
      ]
    }
  ];

  // ─── COMPANIES ─────────────────────────────────────────────────────────────
  const companies = [
    { name: "Google", role: "Software Engineer", ctc: "35 LPA", location: "Bangalore", type: "Product Based", requirements: ["DSA", "System Design", "LLD"], openPositions: 15, description: "Work on products that billions of people use." },
    { name: "Amazon", role: "SDE-1", ctc: "28 LPA", location: "Hyderabad", type: "Product Based", requirements: ["DSA", "AWS", "Leadership Principles"], openPositions: 40, description: "Build customer-centric products at massive scale." },
    { name: "Microsoft", role: "SDE", ctc: "40 LPA", location: "Hyderabad", type: "Product Based", requirements: ["DSA", "System Design", ".NET"], openPositions: 25, description: "Empower every person and organization on the planet." },
    { name: "Infosys", role: "Specialist Programmer", ctc: "8 LPA", location: "Pan India", type: "Service Based", requirements: ["Aptitude", "Java", "SQL"], openPositions: 2000, description: "India's second largest IT company." },
    { name: "TCS", role: "Digital", ctc: "7 LPA", location: "Pan India", type: "Service Based", requirements: ["Aptitude", "Verbal", "Coding"], openPositions: 5000, description: "India's largest IT company, hiring massive batches." },
    { name: "Wipro", role: "Project Engineer", ctc: "6.5 LPA", location: "Pan India", type: "Service Based", requirements: ["Aptitude", "Communication", "Java"], openPositions: 3000, description: "A global leader in IT, consulting and BPS." }
  ];

  // ─── NOTES ─────────────────────────────────────────────────────────────────
  const notes = [
    { title: "Data Structures & Algorithms Cheatsheet", subject: "DSA", type: "PDF", downloads: 1542, size: "2.4 MB", link: "https://cooap.github.io/assets/files/Cheatsheet-Data-Structures-and-Algorithms.pdf" },
    { title: "Operating Systems Fundamentals", subject: "OS", type: "PDF", downloads: 890, size: "1.8 MB", link: "https://raw.githubusercontent.com/S-K-Patel/Operating-System-Notes/master/Operating%20System%20Notes.pdf" },
    { title: "DBMS Normalization & SQL Guide", subject: "DBMS", type: "PDF", downloads: 1205, size: "3.1 MB", link: "https://web.stanford.edu/class/cs345a/slides/normalization.pdf" },
    { title: "Computer Networks Topologies & Protocols", subject: "CN", type: "PDF", downloads: 756, size: "1.5 MB", link: "https://www.isi.edu/nsnam/ns/doc/ns_doc.pdf" },
    { title: "OOPs Concepts with Java Examples", subject: "OOPs", type: "PDF", downloads: 2001, size: "4.2 MB", link: "https://cooap.github.io/assets/files/Cheatsheet-Data-Structures-and-Algorithms.pdf" },
    { title: "System Design Primer", subject: "System Design", type: "PDF", downloads: 3420, size: "5.7 MB", link: "https://web.stanford.edu/class/cs244/papers/DesignSpace.pdf" }
  ];

  // ─── PLACEMENT DRIVES ──────────────────────────────────────────────────────
  const placementDrives = [
    { company: "Google", role: "Software Engineer", ctc: "35.0 LPA", date: "Oct 12, 2026", status: "Open" },
    { company: "Microsoft", role: "SDE", ctc: "40.0 LPA", date: "Oct 18, 2026", status: "Open" },
    { company: "Amazon", role: "SDE-1", ctc: "28.0 LPA", date: "Oct 25, 2026", status: "Open" },
    { company: "TCS Digital", role: "System Engineer", ctc: "7.0 LPA", date: "Nov 02, 2026", status: "Open" },
    { company: "Infosys", role: "Specialist Programmer", ctc: "8.0 LPA", date: "Nov 08, 2026", status: "Open" },
    { company: "Wipro", role: "Project Engineer", ctc: "6.5 LPA", date: "Nov 15, 2026", status: "Open" },
    { company: "Cognizant", role: "GenC Next", ctc: "6.8 LPA", date: "Nov 20, 2026", status: "Open" },
    { company: "Accenture", role: "Associate Software Engineer", ctc: "4.5 LPA", date: "Nov 28, 2026", status: "Open" }
  ];

  await clearAndSeed("codingProblems", problems);
  await clearAndSeed("aptitudeQuestions", aptitude);
  await clearAndSeed("mockTests", mockTests);
  await clearAndSeed("companies", companies);
  await clearAndSeed("notes", notes);
  await clearAndSeed("placementDrives", placementDrives);

  console.log("\n🎉 All data seeded successfully! Firestore is ready.");
  process.exit(0);
};

seedData().catch(err => { console.error("Seeding failed:", err); process.exit(1); });
