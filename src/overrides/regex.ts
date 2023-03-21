RegExp.prototype.test = function (this: RegExp, string: string): boolean {
    /**
     * Not sure why, but for some edge cases `regex.test(string)` would give a cycle of `true` and `false` values.
     * This should fix the issue.
     */
    return !!string.match(this);
};
