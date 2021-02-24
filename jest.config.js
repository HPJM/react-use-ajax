module.exports = {
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
