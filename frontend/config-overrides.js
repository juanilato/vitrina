module.exports = function override(config, env) {
  // Find the babel-loader rule
  const babelLoader = config.module.rules.find(
    rule => rule.oneOf
  );

  if (babelLoader) {
    const babelLoaderRule = babelLoader.oneOf.find(
      rule => rule.loader && rule.loader.includes('babel-loader')
    );

    if (babelLoaderRule) {
      // Modify the exclude pattern to not exclude @mui
      const originalExclude = babelLoaderRule.exclude;

      babelLoaderRule.exclude = function(modulePath) {
        // Don't exclude @mui packages
        if (/@mui/.test(modulePath)) {
          return false;
        }
        // Don't exclude @emotion packages
        if (/@emotion/.test(modulePath)) {
          return false;
        }
        // Use original exclude for everything else
        if (typeof originalExclude === 'function') {
          return originalExclude(modulePath);
        }
        if (originalExclude instanceof RegExp) {
          return originalExclude.test(modulePath);
        }
        return false;
      };
    }
  }

  // Also update the source-map-loader to exclude @mui
  const sourceMapLoader = config.module.rules.find(
    rule => rule.enforce === 'pre' && rule.use && rule.use.some(
      loader => loader.loader && loader.loader.includes('source-map-loader')
    )
  );

  if (sourceMapLoader) {
    sourceMapLoader.exclude = [
      ...(Array.isArray(sourceMapLoader.exclude) ? sourceMapLoader.exclude : [sourceMapLoader.exclude].filter(Boolean)),
      /@mui/,
      /@emotion/,
      /@babel\/runtime/
    ];
  }

  return config;
};
