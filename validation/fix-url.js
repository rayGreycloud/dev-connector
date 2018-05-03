const fixUrl = url => {
  const fixedUrl = /^(https?:\/\/)/ ? url : `https://${url}`;

  return fixedUrl;
};

module.exports = fixUrl;
