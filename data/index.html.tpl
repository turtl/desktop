<!DOCTYPE html>

<html>
  <head>
    <meta http-equiv="Content-Type" content="test/html; charset=utf-8">
    <meta http-equiv="Content-Language" content="en">
    <title>Turtl
    </title>
    <link rel="stylesheet" href="app/css/reset.css">
    <link rel="stylesheet" href="app/css/template.css">
    <link rel="stylesheet" href="app/css/general.css">
{{gencss}}
    <link rel="shortcut icon" href="app/images/favicon.png" type="image/png">
    <script src="app/library/mootools-core-1.4.5.js"></script>
    <script src="app/library/mootools-more-1.4.0.1.js"></script>
    <script src="app/library/composer/composer.js"></script>
    <script src="app/library/composer/composer.relational.js"></script>
    <script src="app/library/composer/composer.filtercollection.js"></script>
    <script src="app/library/composer/composer.keyboard.js"></script>
	<script src="app/config/config.js"></script>
	<script src="app/config/auth.js"></script>
	<script src="app/config/routes.js"></script>
	<script src="../config.js"></script>
	<script src="../tools.js"></script>
	<script src="../comm.js"></script>
	<script src="../invites.js"></script>
	<script src="../popup.js"></script>
	<script src="../notifications.js"></script>
	<script src="../pairing.js"></script>
	<script src="../dispatch.js"></script>
	<script src="../main.js"></script>
{{genjs}}
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
          imageFont: null,
          extensions: ['tex2jax.js'],
          jax: ['input/TeX','output/HTML-CSS'],
          tex2jax: {
            processEscapes: true
          },
          showMathMenu: false,
          showMathMenuMSIE: false,
          showProcessingMessages: false,
          MathMenu: { showRenderer: false },
          'HTML-CSS': {
            showMathMenu: false,
			preferredFont: 'TeX',
            scale: 115
          }
        });
    </script>
	<script src="app/library/mathjax/MathJax.js"></script>
	<script src="templates.js"></script>
  </head>
  <body class="initial">
    <div id="loading-overlay">
      <div>
        <span>Initializing
        </span>
        <span class="spin">/
        </span>
      </div>
    </div>
    <div id="wrap-modal">
      <div id="wrap">
        <div class="sidebar-bg"></div>
        <header class="clear">
          <h1><span>Turtl</span></h1>
          <div class="loading">
            <img src="app/images/site/icons/load_42x11.gif">
          </div>
        </header>
        <div id="main" class="maincontent tex2jax_ignore"></div>
      </div>
    </div>
    <div id="footer">
      <footer>
      </footer>
    </div>
  </body>
</html>


