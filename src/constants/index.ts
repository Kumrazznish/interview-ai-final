import { Clock, Code2, Calendar, Users } from "lucide-react";

export const INTERVIEW_CATEGORY = [
  { id: "upcoming", title: "Upcoming Interviews", variant: "outline" },
  { id: "completed", title: "Completed", variant: "secondary" },
  { id: "succeeded", title: "Succeeded", variant: "default" },
  { id: "failed", title: "Failed", variant: "destructive" },
] as const;

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export const QUICK_ACTIONS = [
  {
    icon: Code2,
    title: "New Call",
    description: "Start an instant call",
    color: "primary",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: Users,
    title: "Join Meeting",
    description: "Enter via invitation link",
    color: "purple-500",
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    icon: Calendar,
    title: "Schedule",
    description: "Plan upcoming interviews",
    color: "blue-500",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  {
    icon: Clock,
    title: "Recordings",
    description: "Access past interviews",
    color: "orange-500",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
];
export const CODING_QUESTIONS: CodeQuestion[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers in the array such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
}`,
      python: `def two_sum(nums, target):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
    }
}`,
    },
    constraints: [
      "2 ≤ nums.length ≤ 104",
      "-109 ≤ nums[i] ≤ 109",
      "-109 ≤ target ≤ 109",
      "Only one valid answer exists.",
    ],
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    starterCode: {
      javascript: `function reverseString(s) {
  // Write your solution here
}`,
      python: `def reverse_string(s):
    # Write your solution here
    pass`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Write your solution here
    }
}`,
    },
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    description:
      "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation:
          "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
    ],
    starterCode: {
      javascript: `function isPalindrome(x) {
  // Write your solution here
}`,
      python: `def is_palindrome(x):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        // Write your solution here
    }
}`,
    },
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    description:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if the brackets are closed in the correct order.",
    examples: [
      {
        input: "s = '()'",
        output: "true",
      },
      {
        input: "s = '()[]{}'",
        output: "true",
      },
      {
        input: "s = '(]'",
        output: "false",
      },
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your solution here
}`,
      python: `def is_valid(s):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
    }
}`,
    },
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    description:
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
      },
    ],
    starterCode: {
      javascript: `function merge(intervals) {
  // Write your solution here
}`,
      python: `def merge(intervals):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your solution here
    }
}`,
    },
  },
  {
    id: "find-duplicate-number",
    title: "Find the Duplicate Number",
    description:
      "Given an array of integers nums containing n + 1 integers where each integer is between 1 and n (inclusive), prove that at least one duplicate number must exist.\n\nReturn the duplicate number.",
    examples: [
      {
        input: "nums = [1,3,4,2,2]",
        output: "2",
      },
      {
        input: "nums = [3,1,3,4,2]",
        output: "3",
      },
    ],
    starterCode: {
      javascript: `function findDuplicate(nums) {
  // Write your solution here
}`,
      python: `def find_duplicate(nums):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int findDuplicate(int[] nums) {
        // Write your solution here
    }
}`,
    },
  },
  {
    id: "linked-list-cycle",
    title: "Linked List Cycle",
    description:
      "Given a linked list, determine if it has a cycle in it. To do this, implement a function that returns true if the linked list has a cycle, otherwise false.",
    examples: [
      {
        input: "head = [3,2,0,-4], pos = 1",
        output: "true",
      },
      {
        input: "head = [1,2], pos = 0",
        output: "true",
      },
      {
        input: "head = [1], pos = -1",
        output: "false",
      },
    ],
    starterCode: {
      javascript: `function hasCycle(head) {
  // Write your solution here
}`,
      python: `def has_cycle(head):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean hasCycle(ListNode head) {
        // Write your solution here
    }
}`,
    },
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    description:
      "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  // Write your solution here
}`,
      python: `def max_sub_array(nums):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
    }
}`,
    },
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    description:
      "You are climbing a staircase. It takes N steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      {
        input: "n = 2",
        output: "2",
      },
      {
        input: "n = 3",
        output: "3",
      },
    ],
    starterCode: {
      javascript: `function climbStairs(n) {
  // Write your solution here
}`,
      python: `def climb_stairs(n):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your solution here
    }
}`,
    },
  },
  // Add more questions as needed...
];


export const LANGUAGES = [
  { id: "javascript", name: "JavaScript", icon: "/javascript.png" },
  { id: "python", name: "Python", icon: "/python.png" },
  { id: "java", name: "Java", icon: "/java.png" },
] as const;

export interface CodeQuestion {
  id: string;
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  constraints?: string[];
}

export type QuickActionType = (typeof QUICK_ACTIONS)[number];
