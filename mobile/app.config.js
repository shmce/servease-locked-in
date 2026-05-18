const app = require('./app.json');

module.exports = ({ config }) => {
  const easProjectId = process.env.EAS_PROJECT_ID?.trim();
  return {
    ...config,
    ...app.expo,
    extra: {
      ...app.expo.extra,
      ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
    },
  };
};
