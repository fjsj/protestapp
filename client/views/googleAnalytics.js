Template.googleAnalytics.rendered = function() {
    new GA('UA-42061506-1');
};

GA = function(code) {
    var _gaq = window._gaq || [];
    _gaq.push(['_setAccount', code]);
    _gaq.push(['_trackPageview']);
    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
};
