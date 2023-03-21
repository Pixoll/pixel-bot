"use strict";
RegExp.prototype.test = function (string) {
    /**
     * Not sure why, but for some edge cases `regex.test(string)` would give a cycle of `true` and `false` values.
     * This should fix the issue.
     */
    return !!string.match(this);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3ZlcnJpZGVzL3JlZ2V4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxVQUF3QixNQUFjO0lBQzFEOzs7T0FHRztJQUNILE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsQ0FBQyxDQUFDIn0=