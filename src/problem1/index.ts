
/**
 * Approach 1: Iterative Loop
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 * Simple and straightforward - iterates through all numbers from 1 to n
 */
var sum_to_n_a = function(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Approach 2: Mathematical Formula (Gauss's Formula)
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 * Most efficient - uses the mathematical formula: n * (n + 1) / 2
 * Handles edge case for n <= 0 by returning 0
 */
var sum_to_n_b = function(n: number): number {
    if (n <= 0) {
        return 0;
    }
    return (n * (n + 1)) / 2;
};

/**
 * Approach 3: Recursive
 * Time Complexity: O(n)
 * Space Complexity: O(n) due to call stack
 * Elegant but less efficient due to function call overhead
 * Handles edge case for n <= 0 by returning 0
 */
var sum_to_n_c = function(n: number): number {
    if (n <= 0) {
        return 0;
    }
    return n + sum_to_n_c(n - 1);
};


