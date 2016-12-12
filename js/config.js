requirejs.config({
  baseUrl: "js",
  paths: {
    jquery: "https://code.jquery.com/jquery-3.1.1.min",
    underscore: "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
    stats: "https://cdnjs.cloudflare.com/ajax/libs/stats.js/r16/Stats.min",
    bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min",
    three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min",
    ps: "particle-system",
  },
  shim: {
    three: { exports: "THREE" },
    stats: { exports: "Stats" },
  },
});
