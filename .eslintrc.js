module.exports = {
  "env": {
    "es6": true,
    "browser": true
  },
  "globals": {
    "atom": true
  },
  "extends": "airbnb",
  "rules": {
    "no-unused-expressions": ["error", {
      "allowShortCircuit": true,
      "allowTernary": true
    }],
    "import/extensions": ["error", "ignorePackages"],
    "import/no-unresolved": ["error", {"ignore": ["atom"]}],
    "max-len": ["error", {"code": 160}],
    "no-underscore-dangle": ["error", {
      "allowAfterThis": true,
      "allowAfterSuper": true
    }],
    "function-paren-newline": "off",
    "no-param-reassign": "off",
    "comma-dangle": "off",
    "no-else-return": "off",
    "no-console": "off",
    "class-methods-use-this": "off"
  }
};
