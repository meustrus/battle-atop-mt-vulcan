function play($, meName, otherName) {
  // Configuration.
  var interactionWaitTime = 600;
  var fadeDelay = 1200;
  var msgDelay = 800;
  var dlgDelay = 800;
  var roshDelay = 800;
  var pongDelay = 800;
  var pongOtherIntervalTime = 500;
  var throbberFade = 200;
  var speechboxLifetime = 2600;
  var speechboxFade = 250;
  var walkSpeed = 12; // milliseconds per pixel.
  var bgAnimSpeed = 600;

  var pongMax = 11;

  var isPlayer1 = (meName < otherName);

  //soundManager.mute();
  var debug = false;




  var $preloadThrobber = $("#preloadThrobber");
  $preloadThrobber.css({display: "none", opacity: 0}).removeClass("hidden");

  var $otherThrobber = $("#otherThrobber");
  $otherThrobber.css({display: "none", opacity: 0}).removeClass("hidden");




  // Preload images.
  var preload_images = [
    ["img/Vulcan.png", "img/Vulcan%20[upper].png", "img/tycho.png", "img/gabe.png", "img/Khai.png"],
    ["img/Pass.png", "img/Pass%20[upper].png", "img/tycho.png", "img/gabe.png", "img/cts.png"],
    ["img/Pass.png", "img/Pass%20[upper].png", "img/tycho.png", "img/gabe.png", "img/cts.png", "img/faces.png", "img/roshambolivo.png", "img/roshambolivo_sprite.png"],
    ["img/006-Mountains01.jpg", "img/Bridge.png", "img/Bridge%20[upper].png", "img/tycho.png", "img/gabe.png", "img/frtfckr.png", "img/fruit1.png"],
    ["img/006-Mountains01.jpg", "img/Bridge.png", "img/Bridge%20[upper].png", "img/tycho.png", "img/gabe.png", "img/frtfckr.png", "img/faces.png", "img/roshambolivo.png", "img/roshambolivo_sprite.png"],
    ["img/006-Mountains01.jpg", "img/Caldera.png", "img/tycho.png", "img/gabe.png"],
    ["img/006-Mountains01.jpg", "img/Caldera.png", "img/tycho.png", "img/gabe.png", "img/pongtable.png", "img/pongpaddle156.png", "img/pongpaddle260.png", "img/pongball.png"],
  ];
  var preload_finished = {};
  var preload_callbacks = {};
  for (var i = 0; i < preload_images.length; ++i) {
    for (var j = 0; j < preload_images[i].length; ++j) {
      var preloader = new Image();
      preloader.onload = (function(i) { return function() {
        preload_finished[i] = (preload_finished[i] || 0) + 1;
        if (preload_finished[i] == preload_images[i].length && $.isArray(preload_callbacks[i])) {
          for (var k = 0; k < preload_callbacks[i].length; ++k) {
            preload_callbacks[i][k].call();
          }
        }
      }})(i);
      preloader.src = preload_images[i][j];
    }
  }

  function onPreloadFinish(i, callback) {
    if (preload_finished[i] == preload_images[i].length) {
      callback();
    }
    else {
      $preloadThrobber.css({display: "block", opacity: 0})
      $preloadThrobber.animate({opacity: 1}, throbberFade);
      preload_callbacks[i] = preload_callbacks[i] || [];
      preload_callbacks[i].push(function() {
        $preloadThrobber.animate({opacity: 0}, throbberFade, function() { $preloadThrobber.css({display: "none"}) });
        callback();
      });
    }
  }




  // Get references to the elements we'll be working with.
  var $playarea = $("#playarea");
  var $playarea_div = $("> div", $playarea);
  var $playarea_top = $("#toplayer", $playarea);

  var $msgarea = $("#msgarea");
  var $msgarea_span = $("span", $msgarea);
  var msg_visible = false;

  $msgarea.css({opacity: 0}).removeClass("hidden");
  $msgarea_span.css({opacity: 0});

  var $dlgarea = $("#dlgarea");
  var $dlgarea_span = $("> div", $dlgarea);
  var $dlgarea_options = $("> div", $dlgarea_span);
  var $dlgarea_w = $(".w p", $dlgarea_span);
  var $dlgarea_a = $(".a p", $dlgarea_span);
  var $dlgarea_s = $(".s p", $dlgarea_span);
  var $dlgarea_d = $(".d p", $dlgarea_span);
  var dlg_visible = false;

  $dlgarea.css({display: "none", opacity: 0}).removeClass("hidden");
  $dlgarea_span.css({opacity: 0});

  var $roshambolivo = $("#roshambolivo");
  var $roshambolivo_div = $("> div", $roshambolivo);
  var $roshambolivo_options = $("> div", $roshambolivo_div);
  var $roshambolivo_rock     = $(".rock",     $roshambolivo_div);
  var $roshambolivo_paper    = $(".paper",    $roshambolivo_div);
  var $roshambolivo_scissors = $(".scissors", $roshambolivo_div);
  var $roshambolivo_lizard   = $(".lizard",   $roshambolivo_div);
  var $roshambolivo_vulcan   = $(".vulcan",   $roshambolivo_div);
  var rosh_visible = false;

  $roshambolivo.css({display: "none", opacity: 0}).removeClass("hidden");
  $roshambolivo_div.css({opacity: 0});

  var $pong = $("#pong");
  var $pongtable = $("#pongtable", $pong);
  var $pongball = $("#pongball", $pong);
  var $pongball_shadow = $("#pongball_shadow", $pong);
  var $pongMyPaddle = $("#mypaddle", $pong);
  var $pongOtherPaddle = $("#otherpaddle", $pong);
  var pong_visible = false;

  $pong.css({display: "none", opacity: 0}).removeClass("hidden");




  // Set up sounds for soundManager.
  soundManager.setup({
    url: "soundmanager/swf",
    onready: function() {
      soundManager.createSound("vulcan", "bgm/ffintro1.ogg");
      soundManager.createSound("pass", "bgm/Khai.ogg");
      soundManager.createSound("cts", "bgm/ZMisc%20devil_gs.ogg");
      soundManager.createSound("ctsBattle", "bgm/boss.mp3");
      soundManager.createSound("bridge", "bgm/Town8.ogg");
      soundManager.createSound("bridgeBattle", "bgm/Battle.ogg");
      soundManager.createSound("caldera", "bgm/ffintro1.ogg");
      soundManager.createSound("showdown", "bgm/Final%20Fight.ogg");
      soundManager.createSound("loss", "bgm/Sleep.ogg");
      soundManager.createSound("victory", "bgm/Victory.ogg");

      soundManager.createSound("kbd", "se/002-System02.ogg");
      soundManager.createSound("scene", "se/013-Move01.ogg");
      soundManager.createSound("rosh_r", "se/043-Knock04.ogg");
      soundManager.createSound("rosh_p", "se/046-Book01.ogg");
      soundManager.createSound("rosh_s", "se/097-Attack09.ogg");
      soundManager.createSound("rosh_l", "se/070-Animal05.ogg");
      soundManager.createSound("rosh_v", "se/135-Light01.ogg");
      soundManager.createSound("die", "se/165-Skill09.ogg");
      soundManager.createSound("ninja", "se/084-Monster06.ogg");
      soundManager.createSound("fruitup", "se/153-Support11.ogg");
      soundManager.createSound("ponghit", "se/032-Switch01.ogg");
      soundManager.createSound("pongscore", "se/056-Right02.ogg");
      soundManager.createSound("pongmiss", "se/058-Wrong02.ogg");
    },
  });

  var startOffsets = {
    "vulcan": 400,
    "pass": 0,
    "cts": 18700,
    "ctsBattle": 0,
    "bridge": 0,
    "bridgeBattle": 28800,
    "caldera": 400,
    "showdown": 0,
    "victory": 0,
  };

  var bgmPlaying;
  var bgmPlay = function(id) {
    if (bgmPlaying) {
      bgmPlaying.stop();
    }

    var fn = function() {
      bgmPlaying.setPosition(startOffsets[id]);
      bgmPlaying.play({onfinish:fn});
    }

    bgmPlaying = soundManager.play(id, {onfinish:fn});
  }

  var bgmStop = function() {
    if (bgmPlaying) {
      bgmPlaying.stop();
    }
  }

  var sePlay = function(id, finishcb) {
    var options = {};
    if (finishcb) {
      options.onfinish = finishcb;
    }
    soundManager.play(id, options);
  }

  // Create a mute button.
  var muted = false;
  var $mute = $("<span class='btn'></span>");
  $("#mute").append($mute);
  $mute.click(function() {
    if (muted) {
      soundManager.unmute();
      $mute.removeClass("enabled");
      muted = false;
    }
    else {
      soundManager.mute();
      $mute.addClass("enabled");
      muted = true;
    }
  });




  // Playarea functions.
  var baseAnim = null;
  var applyBG = function(base, top, numAnimationFrames) {
    if (baseAnim) {
      clearInterval(baseAnim);
      baseAnim = null;
    }

    $playarea_div.css("background-image", "url("+base+")");
    if (numAnimationFrames) {
      var index = -1;
      var fn = function() {
        if (++index >= numAnimationFrames) {
          index = 0;
        }
        $playarea_div.css("background-position", "center " + (index * -640) + "px");
      };
      fn();
      baseAnim = setInterval(fn, bgAnimSpeed);
    }
    else {
      $playarea_div.css("background-position", "center center");
    }

    $playarea_top.css("background-image", top ? "url("+top+")" : "none");
  };

  var fade = function(transition, finished, preloadIndex) {
    $playarea.animate({opacity: 0}, fadeDelay, function() {
      transition();
      if (preloadIndex || preloadIndex === 0) {
        onPreloadFinish(preloadIndex, function() {
          $playarea.animate({opacity: 1}, fadeDelay, finished);
        });
      }
      else {
        $playarea.animate({opacity: 1}, fadeDelay, finished);
      }
    });
  };




  // Message block functions.
  var messageShow = function(msg) {
    var show = function() {
      msg_visible = true;
      $msgarea_span.text(msg);
      $msgarea.css({display:"block"});
      $msgarea.animate({opacity: 1.0}, msgDelay);
      $msgarea_span.animate({opacity: 1.0}, msgDelay);
    };

    if (msg_visible) {
      $msgarea_span.animate({opacity: 0.0}, msgDelay, show);
    }
    else {
      show();
    }
  };

  var messageHide = function() {
    $msgarea.animate({opacity: 0}, msgDelay, function() {
      $msgarea_span.css({opacity: 0});
      $msgarea.css({display:"none"});
      msg_visible = false;
    });
  };




  // Options dialog block functions.
  var dialogShow = function(w, a, s, d, cb) {
    var show = function() {
      dlg_visible = true;

      $dlgarea_options.removeClass("active");
      $dlgarea_options.data("cb", cb);

      $dlgarea_w.text(w);
      $dlgarea_a.text(a);
      $dlgarea_s.text(s);
      $dlgarea_d.text(d);

      $dlgarea.css({display:"block"});
      $dlgarea.animate({opacity: 1.0}, dlgDelay);
      $dlgarea_span.animate({opacity: 1.0}, dlgDelay);
    };

    if (dlg_visible) {
      $dlgarea_span.animate({opacity: 0.0}, dlgDelay, show);
    }
    else {
      show();
    }
  };

  var dialogHide = function() {
    $dlgarea_options.data("cb", null);
    $dlgarea.animate({opacity: 0}, dlgDelay, function() {
      $dlgarea_span.css({opacity: 0});
      $dlgarea.css({display:"none"});
      dlg_visible = false;
    });
  };




  // Roshambolivo functions.
  var roshambolivoShow = function(cb) {
    roshambolivoReset();
    roshambolivoActionDelta = 0;

    var show = function() {
      rosh_visible = true;

      $roshambolivo_options.data("cb", cb);

      $roshambolivo.css("display", "block");
      $roshambolivo.animate({opacity: 1.0}, roshDelay);
      $roshambolivo_div.animate({opacity: 1.0}, roshDelay);
    };

    if (rosh_visible) {
      $roshambolivo_div.animate({opacity: 0.0}, roshDelay, show);
    }
    else {
      show();
    }
  };

  var roshambolivoHide = function() {
    $roshambolivo_options.data("cb", null);
    $roshambolivo.animate({opacity: 0}, roshDelay, function() {
      $roshambolivo_div.css({opacity: 0});
      $roshambolivo.css({display: "none"});
      rosh_visible = false;
    });
  };

  var roshambolivoReset = function() {
    $roshambolivo_options.removeClass("active");
  }

  // -1: Loss, 0: Tie, 1: Win
  var roshambolivoCheckVictory = function(meAction, otherAction) {
    if (meAction === otherAction) {
      return 0;
    }

    switch (meAction) {
      case "a": // Rock
        return (otherAction === "w" || otherAction === "space") ? -1 : 1;
      case "w": // Paper
        return (otherAction === "d" || otherAction === "s") ? -1 : 1;
      case "d": // Scissors
        return (otherAction === "a" || otherAction === "space") ? -1 : 1;
      case "s": // Lizard
        return (otherAction === "a" || otherAction === "d") ? -1 : 1;
      case "space": // Vulcan
        return (otherAction === "w" || otherAction === "s") ? -1 : 1;
    }

    // Shouldn't happen.
    return 0;
  };




  // Bind mouse events to trigger any callbacks on button elements.
  var mousedown = function($this) {
    $this.addClass("active").data("clickedme", true);
  }
  var mouseup = function($this) {
    var cb = $this.data("cb");
    if (cb instanceof Function) {
      sePlay("kbd");
      cb($("> span", $this).text(), $("> p", $this).text());
    }
  }
  var $keyboardButtons = $dlgarea_options.add($roshambolivo_options);
  $keyboardButtons
    .mousedown(function(e) {
      if (e.which === 1) {
        mousedown($(this));
      }
      e.preventDefault();
    })
    .mouseleave(function(e) {
      $keyboardButtons.removeClass("active");
    })
    .mouseenter(function(e) {
      if ($(this).data("clickedme")) {
        $(this).addClass("active");
      }
    })
    .mouseup(function(e) {
      if (e.which === 1 && $(this).data("clickedme")) {
        mouseup($(this));
      }
    });

  $(document).mouseup(function(e) {
    $keyboardButtons.data("clickedme", null);
  });




  // Bind keyDown to trigger the click handler for wasd buttons.
  $(document).keydown(function(e) {
    var de = jQuery.Event("mousedown", { which: 1 });
    var re = jQuery.Event("mousedown", { which: 1 });
    switch (e.which) {
      case 87:
        mousedown($dlgarea_w.parent());
        mousedown($roshambolivo_paper);
        e.preventDefault();
        break;
      case 65:
        mousedown($dlgarea_a.parent());
        mousedown($roshambolivo_rock);
        e.preventDefault();
        break;
      case 83:
        mousedown($dlgarea_s.parent());
        mousedown($roshambolivo_lizard);
        e.preventDefault();
        break;
      case 68:
        mousedown($dlgarea_d.parent());
        mousedown($roshambolivo_scissors);
        e.preventDefault();
        break;
      case 32:
        mousedown($roshambolivo_vulcan);
        e.preventDefault();
        break;
    }
    $keyboardButtons.data("clickedme", null);
  }).keyup(function(e) {
    var de = jQuery.Event("mouseup", { which: 1 });
    de.stopPropagation();
    var re = jQuery.Event("mouseup", { which: 1 });
    switch (e.which) {
      case 87:
        mouseup($dlgarea_w.parent());
        mouseup($roshambolivo_paper);
        e.preventDefault();
        break;
      case 65:
        mouseup($dlgarea_a.parent());
        mouseup($roshambolivo_rock);
        e.preventDefault();
        break;
      case 83:
        mouseup($dlgarea_s.parent());
        mouseup($roshambolivo_lizard);
        e.preventDefault();
        break;
      case 68:
        mouseup($dlgarea_d.parent());
        mouseup($roshambolivo_scissors);
        e.preventDefault();
        break;
      case 32:
        mouseup($roshambolivo_vulcan);
        e.preventDefault();
        break;
    }
    $keyboardButtons.data("clickedme", null);
  });




  // Pong 2.5D functions.
  var pongMatchDelta;
  var pongHitDelta;
  var pongOtherMatchDelta;
  var pongOtherHitDelta;
  var pongOtherLastHitDelta;
  var pongBallInterval;
  var pongBallTimeout;
  var myPaddleEvent1;
  var myPaddleEvent2;
  var myPaddleEvent3;
  var myPaddleTilt = 0;
  var myMouseX = 0;
  var myMouseY = 0;
  var myPaddleHitLast = 0;
  var myPongXVel = 0; // These two store the velocity at the beginning of the match.
  var myPongYVel = 0;
  var otherMouseX = 0;
  var otherMouseY = 0;
  var otherPaddleTilt = 0;
  var otherPaddleTimeout;
  var otherPaddleHitLast = 0;
  var otherPongXVel;
  var otherPongYVel;
  var onPongUpdate;

  var pongPos = $pong.offset();
  $(window).resize(function() { pongPos = $pong.offset(); });

  // Place the pong ball in the "right" place according to the provided virtual
  // position relative to the table.
  var pongBallPosition = function(x, y, z) {
    var s = 24 + z * -0.08, sh = s / 2;
    var l = 480 - sh + (x - 240) * ((300 - z) * 0.0024)
    var t = 440 - s - (100 + z) * (2 - (100 + z) * 0.004);
    var ty = t - y * (s / 32.0);
    $pongball.css({width: s + "px", height: s + "px", left: l + "px", top: ty + "px"});
    $pongball_shadow.css({width: s + "px", height: sh + "px", left: l + "px", top: (t + 16) + "px"});
  };

  // Apply velocity to position.
  var pongBallApplyVelocity = function() {
    $pongball.data("xpos", $pongball.data("xpos") + $pongball.data("xvel"));
    $pongball.data("ypos", $pongball.data("ypos") + $pongball.data("yvel"));
    $pongball.data("zpos", $pongball.data("zpos") + $pongball.data("zvel"));
  }

  var pongShow = function(mePongPoints, otherPongPoints, level, finished, movedon) {
    pongMatchDelta = 0;
    pongHitDelta = 0;
    pongOtherMatchDelta = 0;
    pongOtherHitDelta = 0;
    pongOtherLastHitDelta = 0;

    var enableUpdates = true;
    var newBall;
    var meFirst = isPlayer1;

    // Bind the event that will match the paddle to mouse movements.
    $pong.bind("mousemove", myPaddleEvent1 = function(e) {
      myMouseX = e.pageX - pongPos.left;
      myMouseY = e.pageY - pongPos.top;
      $pongMyPaddle.css({left: (myMouseX - 48) + "px", top: (myMouseY - 78) + "px"});
    });

    // Bind the events that will handle paddle tilting.
    $(document).bind("keydown", myPaddleEvent2 = function(e) {
      if (e.which === 65) {
        myPaddleTilt = -1;
        $pongMyPaddle.css("background-position", "0 0");
      }
      else if (e.which === 68) {
        myPaddleTilt = 1;
        $pongMyPaddle.css("background-position", "-192px 0");
      }
    }).bind("keyup", myPaddleEvent3 = function(e) {
      if ((e.which === 65 && myPaddleTilt === -1) || (e.which === 68 && myPaddleTilt === 1)) {
        myPaddleTilt = 0;
        $pongMyPaddle.css("background-position", "-96px 0");
      }
    });

    // Helper function to be used later: score a point and start a new ball.
    var score = function(meScore, pongPoints) {
      clearInterval(pongBallInterval);
      pongPoints.set(pongPoints.get() + 1);
      sePlay(meScore ? "pongscore" : "pongmiss");
      // Call cb if it's a win.
      if (pongPoints.get() >= pongMax) {
        enableUpdates = false;
        finished(meScore);
      }
      // Otherwise, set up a new ball.
      else {
        meFirst = meScore;
        newBall();
      }
    };

    (function(showFn) {
      // If it's already visible, fade it out before showing it again.
      if (pong_visible) {
        $pong.animate({opacity: 0.0}, pongDelay, showFn);
      }
      else {
        showFn();
      }
    })(function() {
      pong_visible = true;

      // Bind a listener for the opponent's paddle.
      var otherPaddleFn = function() {
        if (!pong_visible || !enableUpdates) {
          return;
        }
        var myAction = pongMatchDelta + ";" + pongHitDelta + ";" + myMouseX + ";" + myMouseY + ";" + myPaddleTilt + ";" + myPaddleHitLast + ";" + myPongXVel + ";" + myPongYVel;
        debugMeter1.set(myAction);
        $.ajax({url:"action.php",data:{me:meName,level:level,action:myAction},complete:otherPaddleFn,success:function(data) {
          var parts = data.split("|");
          // Handle if the other player has moved on.
          if (parts[0] > level) {
            enableUpdates = false;
            movedon(parts[0]);
            return;
          }
          // Handle the other player's pong response.
          if (parts.length === 2) {
            var pongParts = parts[1].split(";");
            if (pongParts.length === 8) {
              debugMeter2.set(parts[1]);
              pongOtherMatchDelta = parseInt(pongParts[0]);
              pongOtherHitDelta = parseInt(pongParts[1]);
              otherMouseX = parseFloat(pongParts[2]);
              otherMouseY = parseFloat(pongParts[3]);
              otherPaddleTilt = parseInt(pongParts[4]);
              otherPaddleHitLast = parseInt(pongParts[5]);
              otherPongXVel = parseFloat(pongParts[6]);
              otherPongYVel = parseFloat(pongParts[7]);

              $pongOtherPaddle.css({
                left: ((otherMouseX - 480) * -0.625 + 480 - 32) + "px",
                top: ((otherMouseY - 400) * 0.625 + 160 - 56) + "px",
                backgroundPosition: (otherPaddleTilt == -1 ? "0 0" : (otherPaddleTilt == 1 ? "-128px 0" : "-64px 0")),
              });

              if (onPongUpdate) {
                onPongUpdate();
              }
            }
          }
        }});
      };
      otherPaddleFn();

      // Set up the basic display.
      $pongball.addClass("hidden");
      $pongball_shadow.addClass("hidden");
      $pong.css("display", "block");
      debugMeter5.set(0);
      // Now that the thing is no longer hidden, update pongPos. When it's
      // hidden, the pos shows up as 0,0.
      pongPos = $pong.offset();
      // Fade it in.
      $pong.animate({opacity: 1.0}, pongDelay, newBall = function() {
        // Increment the action delta for every new ball.
        ++pongMatchDelta;
        // Once it's finished fading in, display the pong ball.
        // Set the positional vector.
        $pongball.data("xpos", 240); // 0..480
        $pongball.data("ypos", 128); // 0....
        $pongball.data("zpos", meFirst ? 90 : -90); // -100..100
        pongBallPosition(240, 128, meFirst ? 90 : -90);
        $pongball.removeClass("hidden");
        $pongball_shadow.removeClass("hidden");
        // Set the velocity vector.
        $pongball.data("zvel", meFirst ? -12 : 12);
        // These are randomized, but both players need to agree. If player1,
        // set it here. If player2, wait until player1's action delta matches
        // and take the xvel and yvel that player generated.
        var startTime = new Date().getTime();
        (function(cont) {
          if (isPlayer1) {
            $pongball.data("xvel", myPongXVel = -16 + Math.random() * 32);
            $pongball.data("yvel", myPongYVel = 2 + Math.random() * 6);
            // Let the opponent know the velocity immediately.
            if (enableUpdates) {
              var myAction = pongMatchDelta + ";" + pongHitDelta + ";" + myMouseX + ";" + myMouseY + ";" + myPaddleTilt + ";" + myPaddleHitLast + ";" + myPongXVel + ";" + myPongYVel;
              $.ajax({url:"action.php",data:{me:meName,level:level,action:myAction}});
            }

            cont();
          }
          (function(cb) {
            onPongUpdate = (cb() ? cb : null);
          })(function() {
            if (pongOtherMatchDelta >= pongMatchDelta) {
              onPongUpdate = null;
              pongMatchDelta = pongOtherMatchDelta;
              if (!isPlayer1) {
                $pongball.data("xvel", -1.0 * parseFloat(otherPongXVel));
                $pongball.data("yvel", parseFloat(otherPongYVel));
              }
              cont();
              return false;
            }
            return true;
          });
        })(function() {
          // Let it hover here for a bit, then set it in motion.
          var timeElapsed = new Date().getTime() - startTime;
          pongBallTimeout = setTimeout(function() {
            if (!pong_visible) {
              return;
            }
            // Make damn sure we don't already have an interval running.
            clearInterval(pongBallInterval);
            pongBallInterval = setInterval(function() {
              if (debugMeter5 >= 0) {
                debugMeter5.set(debugMeter5.get() + 1);
              }
              debugMeter4.set(pongOtherLastHitDelta);
              debugMeter3.set("");
              // Apply the current velocity to the positional vector.
              if ($pongball.data("zpos") < 100 || pongOtherHitDelta > pongOtherLastHitDelta) {
                pongBallApplyVelocity();
                debugMeter3.set(debugMeter3.$elem.text() + String($pongball.data("zvel")) + ":");
              }
              debugMeter3.set(debugMeter3.$elem.text() + String($pongball.data("zpos")) + ":");
              // Check for a collision.
              if ($pongball.data("zpos") <= -100) {
                // Increment the action delta every time we have to have hit it or not.
                ++pongHitDelta;
                myPaddleHitLast = 0;
                var paddleX = (myMouseX - 240) - 48;
                var paddleY = (440 - myMouseY) - 78;
                if ($pongball.data("xpos") > paddleX &&
                    $pongball.data("xpos") < paddleX + 96 &&
                    $pongball.data("ypos") > paddleY &&
                    $pongball.data("ypos") < paddleY + 156) {
                  // Send the ball going in the opposite direction.
                  $pongball.data("zvel", 12);
                  sePlay("ponghit");
                  // If there was a tilt, alter xvel and renormalize velocity.
                  // TODO: normalize
                  if (myPaddleTilt === -1) {
                    $pongball.data("xvel", $pongball.data("xvel") - 15);
                  }
                  else if (myPaddleTilt === 1) {
                    $pongball.data("xvel", $pongball.data("xvel") + 15);
                  }
                  myPaddleHitLast = 5 + myPaddleTilt;
                  // Let the opponent know about the hit.
                  if (enableUpdates) {
                    var myAction = pongMatchDelta + ";" + pongHitDelta + ";" + myMouseX + ";" + myMouseY + ";" + myPaddleTilt + ";" + myPaddleHitLast + ";" + myPongXVel + ";" + myPongYVel;
                    $.ajax({url:"action.php",data:{me:meName,level:level,action:myAction}});
                  }
                  while ($pongball.data("zpos") <= -100) {
                    pongBallApplyVelocity();
                  }
                }
                // If the paddle wasn't there, score the opponent a point.
                else {
                  score(false, otherPongPoints);
                  return;
                }
              }
              else if ($pongball.data("zpos") >= 100) {
                // The ball's in the opponent's court now. Can't do anything
                // until the opponent reports a new action delta.
                if (pongOtherHitDelta <= pongOtherLastHitDelta) {
                  debugMeter5.set(debugMeter5.get() < 0 ? debugMeter5.get() - 1 : -1);
                  return;
                }
                debugMeter5.set(0);
                pongOtherLastHitDelta = pongOtherHitDelta;
                // Check if the opponent hit it. If they moved on, assume they
                // didn't.
                if (otherPaddleHitLast > 0) {
                  debugMeter3.set(debugMeter3.$elem.text() + "otherhit:");
                  // Send the ball going in the opposite direction.
                  $pongball.data("zvel", -12);
                  sePlay("ponghit");
                  // If there was a tilt, alter xvel and renormalize velocity.
                  if (otherPaddleHitLast == 6) {
                    $pongball.data("xvel", $pongball.data("xvel") - 15);
                  }
                  else if (otherPaddleHitLast == 4) {
                    $pongball.data("xvel", $pongball.data("xvel") + 15);
                  }
                  while ($pongball.data("zpos") >= 100) {
                    pongBallApplyVelocity();
                  }
                }
                else {
                  debugMeter3.set(debugMeter3.$elem.text() + "othermiss:");
                  score(true, mePongPoints);
                  return;
                }
              }
              // Check for the ball hitting (or falling off of) the table.
              else if ($pongball.data("ypos") <= 16) {
                // Is the ball still on the table? Don't bother checking the Z
                // direction because that was handled in the paddle check above.
                if ($pongball.data("xpos") >= 0 && $pongball.data("xpos") <= 480) {
                  $pongball.data("ypos", 16);
                  $pongball.data("yvel", -$pongball.data("yvel"));
                  sePlay("ponghit");
                }
                // Otherwise, the person who didn't strike the ball last scores.
                else {
                  if ($pongball.data("zvel") < 0) {
                    score(true, mePongPoints);
                  }
                  else {
                    score(false, otherPongPoints);
                  }
                  return;
                }
              }
              // Apply gravity to the y-component of the velocity vector.
              $pongball.data("yvel", $pongball.data("yvel") - 2.5);
              // Now that we've figured out the vectors, display the ball in the
              // right spot with the right zoom.
              pongBallPosition($pongball.data("xpos"), $pongball.data("ypos"), $pongball.data("zpos"));
            }, 40);
          }, timeElapsed >= 2000 ? 1 : 2000 - timeElapsed);
        });
      });
    });
  };

  var pongHide = function() {
    $pong.unbind("mousemove", myPaddleEvent1);
    $(document).unbind("keydown", myPaddleEvent2).unbind("keyup", myPaddleEvent3);
    clearInterval(pongBallInterval);
    onPongUpdate = null;
    clearTimeout(pongBallTimeout);
    $pong.animate({opacity: 0}, pongDelay, function() {
      $pong.css({display: "none"});
      pong_visible = false;
    });
  };




  // Sprite rendering classes.
  // First create a Sprite. Then apply either a Rect or an Animation to it:
  // s = new Sprite("path/to/Spritesheet");
  // (new Rect(x, y, w, h)).apply(s);

  // Rect class.
  var Rect = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  };

  Rect.prototype.apply = function(sprite) {
    sprite.$elem.css({
      "background-position": -this.x + "px " + -this.y + "px",
      width: this.w+"px",
      height: this.h+"px",
    });
    return this;
  };


  // Animation frame class.
  var AnimFrame = function(milliseconds, rect) {
    this.milliseconds = milliseconds;
    this.rect = rect;
  };


  // Animation class.
  var Animation = function(frames) {
    this.frames = frames;
  };

  Animation.prototype.apply = function(sprite) {
    sprite.frames = this.frames;
    sprite.frameIndex = -1;
    sprite.animFn = function() {
      if (sprite.animFn) {
        ++sprite.frameIndex;
        if (sprite.frameIndex >= sprite.frames.length) {
          sprite.frameIndex = 0;
        }
        sprite.frames[sprite.frameIndex].rect.apply(sprite);
        sprite.animTimeout = setTimeout(sprite.animFn, sprite.frames[sprite.frameIndex].milliseconds);
      }
    };
    sprite.animFn();
    return this;
  };

    // Provide the Sprite to stop and a Rect or Animation to apply.
  Animation.prototype.stop = function(sprite, anim) {
    clearTimeout(sprite.animTimeout);
    sprite.animFn = null;
    if (anim) {
      anim.apply(sprite);
    }
    return this;
  };

  // Sprite class.
  var Sprite = function(url) {
    // On construction, create a div put it in the playarea.
    this.$elem = $("<div></div>");
    this.$elem.css({
      "background-image": "url("+url+")",
      "background-repeat": "no-repeat",
      display: "none",
      position: "absolute",
    });
    $playarea_div.append(this.$elem);
    this.rotation = 0;
  };

  Sprite.prototype.graphic = function(url) {
    this.$elem.css("background-image", "url("+url+")");
  };

  Sprite.prototype.display = function(x, y, z, fadeTime) {
    if (fadeTime) {
      this.$elem.css("opacity", 0.0);
      this.$elem.animate({"opacity": 1.0}, fadeTime);
    }
    this.$elem.css({
      display: "block",
      left: x+"px",
      top: y+"px",
    });
    if (z) {
      this.$elem.css("zIndex", z);
    }
  };

  Sprite.prototype.hide = function(fadeTime) {
    if (fadeTime) {
      this.$elem.animate({"opacity": 0.0}, fadeTime, function() {
        $(this).css({"display": "none", "opacity": 1.0});
      });
    }
    else {
      this.$elem.css({
        display: "none",
      });
    }
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  };

  Sprite.prototype.moveTo = function(x, y, finished) {
    var dist = Math.sqrt(Math.pow(x-parseInt(this.$elem.css("left")),2)+Math.pow(y-parseInt(this.$elem.css("top")),2));
    this.$elem.animate({left:x+"px",top:y+"px"}, dist*walkSpeed, "linear", finished);
  };

  Sprite.prototype.speak = function(msg, bottomNotTop) {
    var $speechbox = $("<div class='speechbox'></div>");
    if (bottomNotTop) {
      $speechbox.css({"bottom":"-24px", "top":"auto"});
    }
    $speechbox.text(msg);
    $speechbox.css("opacity", 0);
    this.$elem.append($speechbox);
    $speechbox.animate({opacity: 1}, speechboxFade);
    setTimeout(function() {
      $speechbox.animate({opacity: 0}, speechboxFade, $speechbox.remove);
    }, speechboxLifetime);
  };

  Sprite.prototype.rotate = function(angle) {
    this.$elem.rotate(this.rotation = angle);
  }

  Sprite.prototype.spin = function(speed) {
    var self = this;
    this.rotationInterval = setInterval(function() {
      self.$elem.rotate(self.rotation += speed);
    }, 50);
  }




  // Face subclass of Sprite.
  var FaceSprite = function() {
    Sprite.call(this, "img/faces.png");
  };

  // Don't need to overwrite any methods, and we don't care about instanceof.
  for (var name in Sprite.prototype) {
    FaceSprite.prototype[name] = Sprite.prototype[name];
  };

  FaceSprite.prototype.set = function(x, y) {
    (new Rect(x * 138, y * 138, 138, 138)).apply(this);
  };




  // HP meter class.
  var HPMeter = function(klass) {
    // On construction, create a div put it in the playarea.
    this.$elem = $("<div class='hp hidden'></div>");
    this.klass = "hp";
    if (klass) {
      this.changeClass(klass);
    }
    $playarea_div.append(this.$elem);
  };

  HPMeter.prototype.changeClass = function(klass) {
    this.$elem.removeClass(this.klass).addClass(this.klass = klass);
  }

  HPMeter.prototype.get = function() {
    return parseInt(this.$elem.text());
  };

  HPMeter.prototype.set = function(amt) {
    this.$elem.text(amt);
  };

  HPMeter.prototype.display = function(x, y, z, fadeTime) {
    if (fadeTime) {
      this.$elem.css("opacity", 0.0);
      this.$elem.animate({"opacity": 1.0}, fadeTime);
    }
    this.$elem.css({
      left: x+"px",
      top: y+"px",
    });
    if (z) {
      this.$elem.css("zIndex", z);
    }

    this.$elem.removeClass("hidden");
  };

  HPMeter.prototype.hide = function(fadeTime) {
    if (fadeTime) {
      this.$elem.animate({"opacity": 0.0}, fadeTime, function() {
        this.$elem.addClass("hidden");
        $(this).css({"opacity": 1.0});
      });
    }
    else {
      this.$elem.addClass("hidden");
    }
  };




  // Roshambolivo action.
  var RoshambolivoAction = function(hpMeter, action) {
    this.hpMeter = hpMeter;
    this.action = action;
  };

  RoshambolivoAction.prototype.resolve = function(action) {
    var resolution = roshambolivoCheckVictory(this.action, action.action);
    if (resolution === -1) {
      this.hpMeter.set(this.hpMeter.get() - 1);
    }
    else if (resolution === 1) {
      action.hpMeter.set(action.hpMeter.get() - 1);
    }
  };

  RoshambolivoAction.prototype.se = function(finishcb) {
    switch (this.action) {
      case 'w':
        sePlay("rosh_p", finishcb);
        break;
      case 'a':
        sePlay("rosh_r", finishcb);
        break;
      case 's':
        sePlay("rosh_l", finishcb);
        break;
      case 'd':
        sePlay("rosh_s", finishcb);
        break;
      case 'space':
        sePlay("rosh_v", finishcb);
        break;
    }
  }




  // Roshambolivo opponent.
  var RoshambolivoOpponent = function(hpMeter, actionMaps) {
    this.hpMeter = hpMeter;
    this.actionMaps = actionMaps;
    this.actionIndex = -1;
  };

  RoshambolivoOpponent.prototype.resolve = function(meAction, otherAction) {
    var myAction = this.pick(meAction, otherAction);

    // Deal with meAction and otherAction.
    myAction.resolve(meAction);
    myAction.resolve(otherAction);

    return myAction;
  };

  RoshambolivoOpponent.prototype.pick = function(meAction, otherAction) {
    ++this.actionIndex;
    if (this.actionIndex >= this.actionMaps.length) {
      this.actionIndex = 0;
    }
    return new RoshambolivoAction(this.hpMeter, this.actionMaps[this.actionIndex][(isPlayer1 ? meAction : otherAction).action][(isPlayer1 ? otherAction : meAction).action]);
  };




  // Handle a game of roshambolivo.
  var roshambolivoActionDelta = 0; // This must be initialized for each new game!
  var roshambolivoHandleAction = function(meAction, meHPMeter, otherHPMeter, opponents, meName, level, finished, movedon) {
    var meRoshAction = new RoshambolivoAction(meHPMeter, meAction);

    // Increment the delta and wait until the other player has also made an action.
    ++roshambolivoActionDelta;
    var playerAction = roshambolivoActionDelta + ";" + meAction;

    $otherThrobber.css({display: "block", opacity: 0})
    var waitFunction = function(data) {
      var parts = data.split("|");
      // Handle if the other player has moved on.
      if (parts[0] > level) {
        movedon(parts[0]);
        return;
      }
      // Handle the other player's roshambolivo response.
      if (parts.length == 2) {
        var roshParts = parts[1].split(";");
        if (roshParts.length == 2 && roshParts[0] >= roshambolivoActionDelta) {
          var meHP = meHPMeter.get();
          // If the other player has made another action, fade out the throbber...
          $otherThrobber.animate({opacity: 0}, throbberFade, function() { $otherThrobber.css({display: "none"}) });
          // ... create that player's action as a RoshambolivoAction ...
          var otherRoshAction = new RoshambolivoAction(otherHPMeter, roshParts[1]);
          // ... resolve otherRoshAction against meRoshAction ...
          meRoshAction.resolve(otherRoshAction);
          // ... and get each opponent's action and apply all actions to the HP Meters...
          var opponentActions = [], outputActions = [];
          for (var i in opponents) {
            if (opponents.hasOwnProperty(i)) {
              var a = opponents[i].resolve(meRoshAction, otherRoshAction)
              opponentActions.push(a);
              outputActions.push(a.action);
            }
          }
          // ... play some sound effects ...
          meRoshAction.se();
          setTimeout(function() {
            var op = 0, fn;
            otherRoshAction.se();
            setTimeout(fn = function() {
              if (op < opponentActions.length) {
                opponentActions[op++].se();
                setTimeout(fn, 300);
              }
              else {
                sePlay(meHPMeter.get() < meHP ? "pongmiss" : "pongscore");
              }
            }, 300);
          }, 300);
          // ... and call our "finished" callback.
          finished(roshParts[1], outputActions);
          return;
        }
      }
      // If we got to this point, the other player has not yet made an action.
      $otherThrobber.animate({opacity: 1}, throbberFade);
      setTimeout(function() {
        $.ajax({url:"action.php",data:{me:meName},success:waitFunction});
      }, interactionWaitTime);
    };

    $.ajax({url:"action.php",data:{me:meName,level:level,action:playerAction},success:waitFunction});
  };




  // Define some basic Animations.
  var charStandDown  = new Rect(0, 0,   32, 80);
  var charStandLeft  = new Rect(0, 80,  32, 80);
  var charStandRight = new Rect(0, 160, 32, 80);
  var charStandUp    = new Rect(0, 240, 32, 80);
  var charWalkDown = new Animation([
    new AnimFrame(300, new Rect(0,  0, 32, 80)),
    new AnimFrame(300, new Rect(32, 0, 32, 80)),
    new AnimFrame(300, new Rect(64, 0, 32, 80)),
    new AnimFrame(300, new Rect(96, 0, 32, 80)),
  ]);
  var charWalkLeft = new Animation([
    new AnimFrame(300, new Rect(0,  80, 32, 80)),
    new AnimFrame(300, new Rect(32, 80, 32, 80)),
    new AnimFrame(300, new Rect(64, 80, 32, 80)),
    new AnimFrame(300, new Rect(96, 80, 32, 80)),
  ]);
  var charWalkRight = new Animation([
    new AnimFrame(300, new Rect(0,  160, 32, 80)),
    new AnimFrame(300, new Rect(32, 160, 32, 80)),
    new AnimFrame(300, new Rect(64, 160, 32, 80)),
    new AnimFrame(300, new Rect(96, 160, 32, 80)),
  ]);
  var charWalkUp = new Animation([
    new AnimFrame(300, new Rect(0,  240, 32, 80)),
    new AnimFrame(300, new Rect(32, 240, 32, 80)),
    new AnimFrame(300, new Rect(64, 240, 32, 80)),
    new AnimFrame(300, new Rect(96, 240, 32, 80)),
  ]);

  var ctsSit   = new Rect(0,  0, 40, 80);
  var ctsPose  = new Rect(40, 0, 40, 80);

  var frtPose1  = new Rect(0,   0, 40, 64);
  var frtPose2  = new Rect(40,  0, 40, 64);

  var frt = new Rect(0, 0, 150, 110);

  var umaroStandDown = new Rect(0, 0, 32, 48);
  var umaroWalkDown = new Animation([
    new AnimFrame(200, new Rect(0, 0, 32, 48)),
    new AnimFrame(200, new Rect(32, 0, 32, 48)),
    new AnimFrame(200, new Rect(0, 0, 32, 48)),
    new AnimFrame(200, new Rect(64, 0, 32, 48)),
  ]);
  var umaroStandUp = new Rect(0, 48, 32, 48);
  var umaroWalkUp = new Animation([
    new AnimFrame(200, new Rect(0, 48, 32, 48)),
    new AnimFrame(200, new Rect(32, 48, 32, 48)),
    new AnimFrame(200, new Rect(0, 48, 32, 48)),
    new AnimFrame(200, new Rect(64, 48, 32, 48)),
  ]);
  var umaroShock = new Rect(0, 96, 32, 48);
  var umaroKneel = new Rect(32, 96, 32, 48);
  var umaroSleep = new Rect(64, 96, 32, 48);

  var roshSprites = {
    "a": new Rect(0, 0,   110, 105),
    "w": new Rect(0, 105, 110, 105),
    "d": new Rect(0, 210, 110, 105),
    "s": new Rect(0, 315, 110, 105),
    "space": new Rect(0, 420, 110, 105),
  };




  // Start the game.
  var meVictory = false;

  var mainSprite1 = new Sprite("img/tycho.png");
  var mainSprite2 = new Sprite("img/gabe.png");

  var meSprite = (isPlayer1 ? mainSprite1 : mainSprite2);
  var otherSprite = (isPlayer1 ? mainSprite2 : mainSprite1);

  var mainFace1 = new Sprite("img/tycho.png");
  var mainFace2 = new Sprite("img/gabe.png");
  charStandDown.apply(mainFace1).apply(mainFace2);

  /*
  var meSprite = new Sprite("img/vex_template_m.png");
  var otherSprite = new Sprite("img/vex_template_m.png");

  var mainSprite1 = (isPlayer1 ? meSprite : otherSprite);
  var mainSprite2 = (isPlayer1 ? otherSprite : meSprite);
  */

  var extraSprite1 = new Sprite("img/Khai.png");
  var extraSprite2 = new Sprite("img/umaro.png");
  var extraSprite3 = new Sprite("img/frtfckr.png");
  var fruitSprite1 = new Sprite("img/fruit1.png");
  var fruitSprite2 = new Sprite("img/fruit1.png");
  frt.apply(fruitSprite1).apply(fruitSprite2);

  var faceSprite1 = new FaceSprite();
  var faceSprite2 = new FaceSprite();
  var faceSprite3 = new FaceSprite();

  var roshSprite1 = new Sprite("img/roshambolivo_sprite.png");
  var roshSprite2 = new Sprite("img/roshambolivo_sprite.png");
  var roshSprite3 = new Sprite("img/roshambolivo_sprite.png");
  var roshSprite4 = new Sprite("img/roshambolivo_sprite.png");
  var roshSprite5 = new Sprite("img/roshambolivo_sprite.png");

  var hpMeter1 = new HPMeter();
  var hpMeter2 = new HPMeter();
  var hpMeter3 = new HPMeter();
  var hpMeter4 = new HPMeter();
  var hpMeter5 = new HPMeter();

  var debugMeter1 = new HPMeter();
  var debugMeter2 = new HPMeter();
  var debugMeter3 = new HPMeter();
  var debugMeter4 = new HPMeter();
  var debugMeter5 = new HPMeter();
  if (debug) {
    debugMeter1.display(32, 480);
    debugMeter2.display(32, 514);
    debugMeter3.display(32, 548);
    debugMeter4.display(32, 582);
    debugMeter5.display(32, 616);
  }

  var meHPMeter = (isPlayer1 ? hpMeter1 : hpMeter2);
  var otherHPMeter = (isPlayer1 ? hpMeter2 : hpMeter1);

  var mePongPoints = new HPMeter("points");
  var otherPongPoints = new HPMeter("points");

  // Roshambolivo action maps.
  var actionMap1 = {
    // Rock
    "a":{
      "a":"w",
      "w":"d",
      "d":"s",
      "s":"space",
      "space":"a",
    },
    // Paper
    "w":{
      "a":"d",
      "w":"d",
      "d":"space",
      "s":"a",
      "space":"a",
    },
    // Scissors
    "d":{
      "a":"s",
      "w":"d",
      "d":"a",
      "s":"s",
      "space":"s",
    },
    // Lizard
    "s":{
      "a":"space",
      "w":"d",
      "d":"d",
      "s":"a",
      "space":"space",
    },
    // Vulcan
    "space":{
      "a":"a",
      "w":"d",
      "d":"space",
      "s":"s",
      "space":"w",
    },
  };
  var actionMap2 = {
    // Rock
    "a":{
      "a":"a",
      "w":"d",
      "d":"space",
      "s":"s",
      "space":"w",
    },
    // Paper
    "w":{
      "a":"s",
      "w":"d",
      "d":"a",
      "s":"s",
      "space":"s",
    },
    // Scissors
    "d":{
      "a":"w",
      "w":"d",
      "d":"s",
      "s":"space",
      "space":"a",
    },
    // Lizard
    "s":{
      "a":"d",
      "w":"d",
      "d":"space",
      "s":"a",
      "space":"a",
    },
    // Vulcan
    "space":{
      "a":"space",
      "w":"d",
      "d":"d",
      "s":"a",
      "space":"space",
    },
  };
  var actionMap3 = {
    // Rock
    "a":{
      "a":"s",
      "w":"d",
      "d":"a",
      "s":"s",
      "space":"s",
    },
    // Paper
    "w":{
      "a":"w",
      "w":"d",
      "d":"s",
      "s":"space",
      "space":"a",
    },
    // Scissors
    "d":{
      "a":"space",
      "w":"d",
      "d":"d",
      "s":"a",
      "space":"space",
    },
    // Lizard
    "s":{
      "a":"a",
      "w":"d",
      "d":"space",
      "s":"s",
      "space":"w",
    },
    // Vulcan
    "space":{
      "a":"d",
      "w":"d",
      "d":"space",
      "s":"a",
      "space":"a",
    },
  };

  // Cardboard Tube Samurai roshambolivo opponent.
  var ctsOpponent = new RoshambolivoOpponent(hpMeter3, [actionMap1]);

  // Fruit Fucker Roshambolivo opponent 1.
  var frtOpponent1 = new RoshambolivoOpponent(hpMeter3, [actionMap2, actionMap1, actionMap3]);
  // Fruit Fucker Roshambolivo opponent 2.
  var frtOpponent2 = new RoshambolivoOpponent(hpMeter4, [actionMap3, actionMap2, actionMap1]);
  // Fruit Fucker Roshambolivo opponent 3.
  var frtOpponent3 = new RoshambolivoOpponent(hpMeter5, [actionMap1, actionMap3, actionMap2]);

  var levelStart = function(level, action, first) {
    // Store the function for below when we actually wait to call it.
    var successFunction = function(otherLevel, otherAction) {

      if (otherAction) {
        otherSprite.speak(otherAction, true);
      }

      // Sanity check: did the other player go on to the end game?
      if (!first && level < 1000 && otherLevel >= 1000) {
        level = parseInt(otherLevel);
        action = (otherAction == "I won!" ? "I lost..." : "I won!");
      }

      switch (level) {
        case 100:
          fade(function() {
            // Initialize the map.
            applyBG("img/Vulcan.png", "img/Vulcan%20[upper].png");
            bgmPlay("vulcan");

            // Initialize the Sprites in a "walking up" Animation.
            charWalkUp.apply(meSprite).apply(otherSprite);
            mainSprite1.display(416, 640);
            mainSprite2.display(512, 640);

            // Initiaize the extra Sprite in a "standing down" pose.
            extraSprite1.graphic("img/Khai.png");
            charStandDown.apply(extraSprite1);
            extraSprite1.display(464, 316);
          }, function() {
            // Animate the Sprites moving into position.
            mainSprite1.moveTo(416, 400, function() {
              charWalkUp.stop(mainSprite1, charStandUp);
            });
            mainSprite2.moveTo(512, 400, function() {
              // When the Sprites are finished moving, cease Animation and move on
              // to the next level.
              charWalkUp.stop(mainSprite2, charStandUp);
              levelStart(110);
            });
          }, 0);

          break;

        case 110:
          messageShow("\nSo you want to climb Mt. Vulcan.");
          dialogShow(
            "Of course!",
            "What?",
            "That's no mountain...",
            "You can't make me!",
            function(key, answer) {
              meSprite.speak(answer);
              levelStart(111, answer);
            }
          );
          break;

        case 111:
          charStandRight.apply(mainSprite1);
          charStandLeft.apply(mainSprite2);

          messageShow("\nYou and your \"friend\" must make it to the top.");
          dialogShow(
            "Yes ... \"friend\".",
            "That one? We've never met.",
            "I said I'm not going!",
            "I'll be the only one left alive!",
            function(key, answer) {
              meSprite.speak(answer);
              levelStart(112, answer);
            }
          );
          break;

        case 112:
          messageShow("\nWhen you arrive, you will engage in ritual combat above the caldera.");
          dialogShow(
            "But I'm a pacifist!",
            "Yes! Death! Killing!",
            "Can't we have tea and scones instead?",
            "Above the what now?",
            function(key, answer) {
              meSprite.speak(answer);
              levelStart(113, answer);
            }
          );
          break;

        case 113:
          messageShow("\nGood luck!");
          dialogHide();
          setTimeout(function() {
            sePlay("scene");
            levelStart(200);
          }, 3000);
          break;

        case 200:
          messageHide();
          fade(function() {
            applyBG("img/Pass.png", "img/Pass%20[upper].png");
            bgmPlay("pass");
            mainSprite1.hide();
            mainSprite2.hide();
            extraSprite1.hide();
          }, function() {
            levelStart(201);
          }, 1);
          break;

        case 201:
          // Initialize the Sprites in a "walking up" Animation.
          charWalkUp.apply(meSprite).apply(otherSprite);
          mainSprite1.display(256, 640);
          mainSprite2.display(256, 736);

          // Initiaize the extra Sprite in a "sitting" pose.
          extraSprite1.graphic("img/cts.png");
          ctsSit.apply(extraSprite1);
          extraSprite1.display(312, 144);

          // Initialize Umaro.
          extraSprite2.graphic("img/umaro.png");

          // Animate the characters moving into position.
          mainSprite1.moveTo(256, 600, function() {
            mainSprite1.moveTo(288, 568, function() {
              mainSprite1.moveTo(320, 526, function() {
                mainSprite1.moveTo(320, 496, function() {
                  mainSprite1.moveTo(352, 464, function() {
                    charWalkUp.stop(mainSprite1, charWalkRight);
                    mainSprite1.moveTo(544, 392, function() {

                      umaroWalkDown.apply(extraSprite2);
                      extraSprite2.display(640, -48);
                      extraSprite2.moveTo(640, 32, function() {
                        umaroWalkDown.stop(extraSprite2, umaroStandDown);
                      });

                      mainSprite1.moveTo(624, 392, function() {
                        charWalkRight.stop(mainSprite1, charWalkUp);
                        mainSprite1.moveTo(672, 352, function() {
                          mainSprite1.moveTo(672, 288, function() {
                            charWalkUp.stop(mainSprite1, charWalkLeft);
                            mainSprite1.moveTo(624, 240, function() {
                              mainSprite1.moveTo(544, 240, function() {
                                mainSprite1.moveTo(432, 128, function() {
                                  charWalkLeft.stop(mainSprite1, charStandLeft);
                                  levelStart(202);
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          mainSprite2.moveTo(256, 600, function() {
            mainSprite2.moveTo(288, 568, function() {
              mainSprite2.moveTo(320, 526, function() {
                mainSprite2.moveTo(320, 496, function() {
                  mainSprite2.moveTo(352, 464, function() {
                    charWalkUp.stop(mainSprite2, charWalkRight);
                    mainSprite2.moveTo(544, 392, function() {
                      mainSprite2.moveTo(624, 392, function() {
                        charWalkRight.stop(mainSprite2, charWalkUp);
                        mainSprite2.moveTo(672, 352, function() {

                          if (Math.random() >= 0.75) {
                            umaroKneel.apply(extraSprite2);
                            setTimeout(function() {
                              umaroSleep.apply(extraSprite2);
                              setTimeout(function() {
                                umaroKneel.apply(extraSprite2);
                                setTimeout(function() {
                                  umaroStandDown.apply(extraSprite2);
                                  setTimeout(function() {
                                    umaroWalkUp.apply(extraSprite2);
                                    extraSprite2.moveTo(640, -48, function() {
                                      umaroWalkUp.stop(extraSprite2, umaroStandUp);
                                      extraSprite2.hide();
                                    });
                                  }, 1000);
                                }, 1000);
                              }, 3000);
                            }, 1000);
                          }
                          else {
                            umaroShock.apply(extraSprite2);
                            setTimeout(function() {
                              umaroStandDown.apply(extraSprite2);
                              setTimeout(function() {
                                umaroWalkUp.apply(extraSprite2);
                                extraSprite2.moveTo(640, -48, function() {
                                  umaroWalkUp.stop(extraSprite2, umaroStandUp);
                                  extraSprite2.hide();
                                });
                              }, 200);
                            }, 1000);
                          }

                          mainSprite2.moveTo(672, 288, function() {
                            charWalkUp.stop(mainSprite2, charWalkLeft);
                            mainSprite2.moveTo(624, 240, function() {
                              mainSprite2.moveTo(544, 240, function() {
                                mainSprite2.moveTo(480, 176, function() {
                                  mainSprite2.moveTo(416, 176, function() {
                                    charWalkLeft.stop(mainSprite2, charStandLeft);
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          break;

        case 202:
          bgmPlay("cts");
          messageShow("\nWelcome to my mountain.");
          dialogShow(
            "It's a nice mountain.",
            "I thought it was my mountain!",
            "I just want to go home.",
            "And just who are you?",
            function(key, answer) {
              meSprite.speak(answer);
              levelStart(206, answer);
            }
          );
          break;

        case 206:
          messageShow("\nI am the Cardboard Tube Samurai.\nAre you friend or foe?");
          dialogShow(
            "I've no quarrel with you.",
            "Definitely a toe. I mean foe.",
            "Depends.",
            "Never! I mean please don't hurt me!",
            function(key, answer) {
              meSprite.speak(answer);
              if (key === "a") {
                levelStart(247, answer);
              }
              else if (key === "s") {
                levelStart(213, answer);
              }
              else {
                levelStart(227, answer);
              }
            }
          );
          break;

        case 213:
          if (otherLevel > 240) {
            levelStart(247);
            break;
          }

          messageShow("Depends on you, I suppose.\nI defend the weak and helpless.\nSo are you my friend or my foe?");
          dialogShow(
            "I've no quarrel with you.",
            "I am sworn to destroy the universe.",
            "I consume the things you love for second lunch!",
            "I'm weak! This other guy will kill me!",
            function(key, answer) {
              meSprite.speak(answer);
              if (key === "w") {
                levelStart(227, answer);
              }
              else if (key === "d") {
                levelStart(214, answer);
              }
              else {
                levelStart(247, answer);
              }
            }
          );
          break;

        case 214:
          if (otherLevel > 240) {
            levelStart(247);
            break;
          }

          messageShow("\nTell me about your companion.\nShould I be...concerned?");
          dialogShow(
            "Couldn't kill a kitten if he tried.",
            "I've got this one on a tight leash.",
            "This one finds no pleasure without the blood of the innocent!",
            "Don't let that thing near me!",
            function(key, answer) {
              meSprite.speak(answer);
              if (key === "w" || key === "a") {
                levelStart(227, answer);
              }
              else {
                levelStart(247, answer);
              }
            }
          );
          break;

        case 227:
          if (otherLevel > 240) {
            levelStart(247);
            break;
          }

          messageShow("Then I offer you a warning:\nUp ahead you will encounter the most vile of creatures.\nIf you wish to survive, I must instruct you in the ways of combat on Mt. Vulcan.");
          dialogShow(
            "I am most gracious.",
            "Tell me how to most viciously brutalize them!",
            "That sounds scary. Can't I just go home?",
            "I just want to  desecrate their corpses.",
            function(key, answer) {
              meSprite.speak(answer);
              levelStart(258, answer);
            }
          );
          break;

        case 247:
          messageShow("\nThen you must die!");
          dialogShow(
            "But I don't deserve your wrath!",
            "If that is how it must be...",
            "Yes! Have at thee! And that! And everything else that gets in my way!",
            "What!? But I'm not the sociopath!",
            function(key, answer) {
              meSprite.speak(answer);
              levelStart(258, answer);
            }
          );
          break;

        case 258:
          ctsPose.apply(extraSprite1);
          messageShow("\nDefend yourselves!");
          dialogHide();
          setTimeout(function() { levelStart(300); }, 5000);
          break;

        case 300:
          // Defaults in case of re-entry.
          bgmPlay("ctsBattle");
          applyBG("img/Pass.png", "img/Pass%20[upper].png");
          $playarea.css("opacity", 1);
          charStandLeft.apply(mainSprite1).apply(mainSprite2);
          mainSprite1.display(432, 128);
          mainSprite2.display(416, 176);
          extraSprite1.graphic("img/cts.png");
          ctsPose.apply(extraSprite1);
          extraSprite1.display(312, 144);

          messageShow("The game is Roshambolivo (Rock Paper Scissors Lizard...Vulcan).\nPick a play and it will play against your partner and every opponent.\nEach defeat drains HP until that player loses!");
          faceSprite1.set(0, 0);
          faceSprite1.display(32,128, 55);
          hpMeter3.set(5);
          hpMeter3.display(32, 268, 55);

          hpMeter1.set(10);
          hpMeter1.display(790, 208, 55);
          mainFace1.display(790, 124, 55);
          hpMeter2.set(10);
          hpMeter2.display(790, 352, 55);
          mainFace2.display(790, 268, 55);

          roshambolivoShow(function(meAction) {
            roshambolivoHandleAction(meAction, meHPMeter, otherHPMeter, [ctsOpponent], meName, level, function(otherAction, opponentActions) {
              roshSprites[meAction].apply(roshSprite1);
              roshSprite1.display(680, isPlayer1 ? 101 : 247, 60, 200);
              roshSprites[otherAction].apply(roshSprite2);
              roshSprite2.display(680, isPlayer1 ? 247 : 101, 60, 200);
              roshSprites[opponentActions[0]].apply(roshSprite3);
              roshSprite3.display(170, 195, 60, 200);

              setTimeout(function() {
                roshSprite1.hide(200);
                roshSprite2.hide(200);
                roshSprite3.hide(200);
              }, 2000);

              // Check each HP Meter to see if anybody has died.
              if (hpMeter1.get() <= 0) {
                sePlay("die");
                meVictory = !isPlayer1 && hpMeter2.get() > 0;
                levelStart(1300, meVictory ? "I won!" : "I lost...");
              }
              else if (hpMeter2.get() <= 0) {
                sePlay("die");
                meVictory = isPlayer1 && hpMeter1.get() > 0;
                levelStart(1300, meVictory ? "I won!" : "I lost...");
              }
              else if (hpMeter3.get() <= 0) {
                sePlay("die");
                levelStart(391);
              }
              else {
                roshambolivoReset();
              }
            }, function(otherLevel) {
              sePlay("die");
              if (hpMeter1.get() <= 0) {
                meVictory = !isPlayer1 && hpMeter2.get() > 0;
                levelStart(1300, meVictory ? "I won!" : "I lost...");
              }
              else if (hpMeter2.get() <= 0) {
                meVictory = isPlayer1 && hpMeter1.get() > 0;
                levelStart(1300, meVictory ? "I won!" : "I lost...");
              }
              else {
                levelStart(391);
              }
            });
          });
          break;

        case 391:
          bgmPlay("pass");
          roshambolivoHide();
          mainFace1.hide();
          mainFace2.hide();
          faceSprite1.hide();
          hpMeter1.hide();
          hpMeter2.hide()
          hpMeter3.hide();
          setTimeout(function() {
            ctsSit.apply(extraSprite1);
            messageShow("\nYou are ready.");
            setTimeout(function() {
              // Moving out!
              charWalkUp.apply(mainSprite1).apply(mainSprite2);
              mainSprite1.moveTo(416, 112, function() {
                mainSprite1.moveTo(416, 48, function() {
                  messageHide();
                  mainSprite1.moveTo(448, 16, function() {
                    mainSprite1.moveTo(448, 0, function() {
                      mainSprite1.moveTo(480, -32, function() {
                        mainSprite1.moveTo(480, -80, function() {
                          charWalkUp.stop(mainSprite1, charStandLeft);
                          sePlay("scene");
                          levelStart(400);
                        });
                      });
                    });
                  });
                });
                mainSprite2.moveTo(416, 48, function() {
                  mainSprite2.moveTo(448, 16, function() {
                    mainSprite2.moveTo(448, 16, function() {
                      mainSprite2.moveTo(448, 0, function() {
                        mainSprite2.moveTo(480, -32, function() {
                          mainSprite2.moveTo(480, -80, function() {
                            charWalkUp.stop(mainSprite2, charStandLeft);
                          });
                        });
                      });
                    });
                  });
                });
              });
            }, 2000);
          }, 2000);
          break;

        case 400:
          fade(function() {
            bgmPlay("bridge");
            applyBG("img/Bridge.png", "img/Bridge%20[upper].png");
            mainSprite1.hide();
            mainSprite2.hide();
            extraSprite1.hide();
            extraSprite2.hide();
          }, function() {
            levelStart(401);
          }, 3);
          break;

        case 401:
          // Initialize the Sprites in a "walking left" Animation.
          charWalkLeft.apply(meSprite).apply(otherSprite);
          mainSprite1.display(960, 304);
          mainSprite2.display(992, 368);

          // Initiaize 3 extra Sprites in the first pose.
          extraSprite1.graphic("img/frtfckr.png");
          extraSprite2.graphic("img/frtfckr.png");
          extraSprite3.graphic("img/frtfckr.png");
          frtPose1.apply(extraSprite1).apply(extraSprite2).apply(extraSprite3);

          // Animate the characters moving into position.
          mainSprite1.moveTo(896, 304, function() {
            mainSprite1.moveTo(872, 328, function() {
              mainSprite1.moveTo(784, 328, function() {
                mainSprite1.moveTo(752, 336, function() {
                  mainSprite1.moveTo(592, 336, function() {
                    mainSprite1.moveTo(560, 328, function() {
                      // Animate the first demon.
                      extraSprite1.display(348, 432, 5);
                      extraSprite1.$elem.animate({left: "316px"}, {
                        duration: 300,
                        easing: "linear",
                        step: function(currentLeft) {
                          var x = currentLeft - 336.3;
                          extraSprite1.$elem.css({top: (400+x*x/8.556)+"px"});
                          if (currentLeft < 328) {
                            extraSprite1.$elem.css({zIndex: 15});
                          }
                        },
                        complete: function() {
                          extraSprite1.$elem.animate({left: "412px"}, {
                            duration: 500,
                            easing: "linear",
                            step: function(currentLeft) {
                              var x = currentLeft - 374.8;
                              extraSprite1.$elem.css({top: (272+x*x*0.0581)+"px"});
                            },
                          });
                        },
                      });
                      mainSprite1.moveTo(536, 328, function() {
                        // Animate the second demon.
                        extraSprite2.display(380, 528, 5);
                        extraSprite2.$elem.animate({left: "428px"}, {
                          duration: 600,
                          easing: "linear",
                          step: function(currentLeft) {
                            var x = currentLeft - 412;
                            extraSprite2.$elem.css({top: (240+x*x*0.25)+"px"});
                            if (currentLeft > 382) {
                              extraSprite2.$elem.css({zIndex: 14});
                            }
                          },
                        });
                        mainSprite1.moveTo(512, 304, function() {
                          // Animate the third demon.
                          extraSprite3.display(364, 288, 1);
                          extraSprite3.$elem.animate({left: "460px"}, {
                            duration: 450,
                            easing: "linear",
                            step: function(currentLeft) {
                              var x = currentLeft - 400;
                              extraSprite3.$elem.css({top: (192+x*x/21)+"px"});
                              if (currentLeft > 400) {
                                extraSprite3.$elem.css({zIndex: 16});
                              }
                            },
                          });
                          mainSprite1.moveTo(496, 304, function() {
                            charWalkLeft.stop(mainSprite1, charStandLeft);
                            levelStart(402);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          mainSprite2.moveTo(896, 368, function() {
            mainSprite2.moveTo(856, 328, function() {
              mainSprite2.moveTo(784, 328, function() {
                mainSprite2.moveTo(752, 336, function() {
                  mainSprite2.moveTo(592, 336, function() {
                    mainSprite2.moveTo(560, 328, function() {
                      mainSprite2.moveTo(536, 328, function() {
                        mainSprite2.moveTo(528, 328, function() {
                          charWalkLeft.stop(mainSprite2, charStandLeft);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          break;

        case 402:
          messageShow("\nOh no! Fruit-Fucking-Ninjas!");
          var i = 0, buzzAnim = function() {
            extraSprite1.display(412, i % 2 ? 350 : 352, 15);
            extraSprite2.display(428, i % 2 ? 302 : 304, 14);
            extraSprite3.display(460, i % 2 ? 361 : 363, 16);
            if (i++ < 30) {
              setTimeout(buzzAnim, 40);
            }
            else {
              frtPose1.apply(extraSprite1).apply(extraSprite2).apply(extraSprite3);
            }
          }
          setTimeout(function() {
            sePlay("ninja");
            frtPose2.apply(extraSprite1).apply(extraSprite2).apply(extraSprite3);
            buzzAnim();
          }, 200);

          setTimeout(function() {
            fruitSprite1.display(240, 640, 20);
            fruitSprite2.display(640, 640, 20);
            fruitSprite1.spin(8);
            fruitSprite2.spin(-12);
            sePlay("fruitup");

            fruitSprite1.$elem.animate({left: "720px"}, {
              duration: 2500,
              easing: "linear",
              step: function(currentLeft) {
                var x = currentLeft - 480;
                fruitSprite1.$elem.css({top: (300+0.0059*x*x)+"px"});
              },
            });

            fruitSprite2.$elem.animate({left: "280px"}, {
              duration: 2500,
              easing: "linear",
              step: function(currentLeft) {
                var x = currentLeft - 460;
                fruitSprite2.$elem.css({top: (100+0.02*x*x)+"px"});
              },
            });

            setTimeout(function() {
              fruitSprite1.hide();
              fruitSprite2.hide();
              levelStart(500);
            }, 3000);
          }, 2000);
          break;

        case 500:
          // Defaults in case of re-entry.
          bgmPlay("bridgeBattle");
          applyBG("img/Bridge.png", "img/Bridge%20[upper].png");
          $playarea.css("opacity", 1);
          charStandLeft.apply(mainSprite1).apply(mainSprite2);
          mainSprite1.display(496, 304);
          mainSprite2.display(528, 328);

          extraSprite1.graphic("img/frtfckr.png");
          extraSprite2.graphic("img/frtfckr.png");
          extraSprite3.graphic("img/frtfckr.png");

          frtPose1.apply(extraSprite1).apply(extraSprite2).apply(extraSprite3);
          extraSprite1.display(412, 352, 15);
          extraSprite2.display(428, 304, 14);
          extraSprite3.display(460, 363, 16);

          messageHide();

          faceSprite1.set(1, 0);
          faceSprite1.display(32, 118, 55);
          hpMeter3.set(3);
          hpMeter3.display(32, 258, 55);

          faceSprite2.set(1, 0);
          faceSprite2.display(32, 290, 55);
          hpMeter4.set(3);
          hpMeter4.display(32, 430, 55);

          faceSprite3.set(1, 0);
          faceSprite3.display(32, 468, 55);
          hpMeter5.set(3);
          hpMeter5.display(32, 608, 55);

          hpMeter1.set(10);
          hpMeter1.display(790, 208, 55);
          mainFace1.display(790, 124, 55);
          hpMeter2.set(10);
          hpMeter2.display(790, 352, 55);
          mainFace2.display(790, 268, 55);

          var opponents = [frtOpponent1, frtOpponent2, frtOpponent3];
          var opponentMap = [0, 1, 2];
          roshambolivoShow(function(meAction) {
            roshambolivoHandleAction(meAction, meHPMeter, otherHPMeter, opponents, meName, level, function(otherAction, opponentActions) {
              roshSprites[meAction].apply(roshSprite1);
              roshSprite1.display(680, isPlayer1 ? 91 : 237, 60, 200);

              roshSprites[otherAction].apply(roshSprite2);
              roshSprite2.display(680, isPlayer1 ? 237 : 91, 60, 200);


              if (opponentMap[0] >= 0) {
                sePlay("die");
                roshSprites[opponentActions[opponentMap[0]]].apply(roshSprite3);
                roshSprite3.display(170, 185, 60, 200);
                // Check if this one has died.
                if (hpMeter3.get() <= 0) {
                  opponents.splice(opponentMap[0], 1);
                  opponentMap[0] = -1;
                  --opponentMap[1];
                  --opponentMap[2];
                  faceSprite1.hide();
                  hpMeter3.hide();
                  extraSprite1.hide();
                }
              }

              if (opponentMap[1] >= 0) {
                sePlay("die");
                roshSprites[opponentActions[opponentMap[1]]].apply(roshSprite4);
                roshSprite4.display(170, 363, 60, 200);
                // Check if this one has died.
                if (hpMeter4.get() <= 0) {
                  opponents.splice(opponentMap[1], 1);
                  opponentMap[1] = -1;
                  --opponentMap[2];
                  faceSprite2.hide();
                  hpMeter4.hide();
                  extraSprite2.hide();
                }
              }

              if (opponentMap[2] >= 0) {
                sePlay("die");
                roshSprites[opponentActions[opponentMap[2]]].apply(roshSprite5);
                roshSprite5.display(170, 541, 60, 200);
                // Check if this one has died.
                if (hpMeter5.get() <= 0) {
                  opponents.splice(opponentMap[2], 1);
                  opponentMap[2] = -1;
                  faceSprite3.hide();
                  hpMeter5.hide();
                  extraSprite3.hide();
                }
              }

              setTimeout(function() {
                roshSprite1.hide(200);
                roshSprite2.hide(200);
                roshSprite3.hide(200);
                roshSprite4.hide(200);
                roshSprite5.hide(200);
              }, 2000);

              // Check each HP Meter to see if anybody has died.
              if (hpMeter1.get() <= 0) {
                sePlay("die");
                meVictory = !isPlayer1 && hpMeter2.get() > 0;
                levelStart(1500, meVictory ? "I won!" : "I lost...");
              }
              else if (hpMeter2.get() <= 0) {
                sePlay("die");
                meVictory = isPlayer1 && hpMeter1.get() > 0;
                levelStart(1500, meVictory ? "I won!" : "I lost...");
              }
              else if (hpMeter3.get() <= 0 && hpMeter4.get() <= 0 && hpMeter5.get() <= 0) {
                levelStart(591);
              }
              else {
                roshambolivoReset();
              }
            }, function(otherLevel) {
              if (hpMeter1.get() <= 0) {
                sePlay("die");
                meVictory = !isPlayer1 && hpMeter2.get() > 0;
                levelStart(1500, meVictory ? "I won!" : "I lost...");
              }
              else if (hpMeter2.get() <= 0) {
                sePlay("die");
                meVictory = isPlayer1 && hpMeter1.get() > 0;
                levelStart(1500, meVictory ? "I won!" : "I lost...");
              }
              else {
                levelStart(591);
              }
            });
          });
          break;

        case 591:
          bgmPlay("bridge");
          roshambolivoHide();
          mainFace1.hide();
          mainFace2.hide();
          hpMeter1.hide();
          hpMeter2.hide();
          hpMeter3.hide();
          hpMeter4.hide();
          hpMeter5.hide();
          faceSprite1.hide();
          faceSprite2.hide();
          faceSprite3.hide();
          extraSprite1.hide();
          extraSprite2.hide();
          extraSprite3.hide();

          messageShow("\nWhew. Dodged that pulp spray at the last second.");
          // Moving out!
          charWalkLeft.apply(mainSprite1).apply(mainSprite2);
          mainSprite1.moveTo(336, 304, function() {
            mainSprite1.moveTo(208, 240, function() {
              messageHide();
              mainSprite1.moveTo(64, 240, function() {
                mainSprite1.moveTo(32, 272, function() {
                  mainSprite1.moveTo(-32, 272, function() {
                    charWalkLeft.stop(mainSprite1, charStandUp);
                    sePlay("scene");
                    levelStart(600);
                  });
                });
              });
            });
          });
          mainSprite2.moveTo(520, 328, function() {
            mainSprite2.moveTo(496, 304, function() {
              mainSprite2.moveTo(336, 304, function() {
                mainSprite2.moveTo(208, 240, function() {
                  mainSprite2.moveTo(64, 240, function() {
                    mainSprite2.moveTo(32, 272, function() {
                      mainSprite2.moveTo(-32, 272, function() {
                        charWalkLeft.stop(mainSprite2, charStandUp);
                      });
                    });
                  });
                });
              });
            });
          });
          break;

        case 600:
          fade(function() {
            bgmPlay("caldera");
            applyBG("img/Caldera.png", null, 4);
            mainSprite1.hide();
            mainSprite2.hide();
          }, function() {
            levelStart(601);
          }, 5);
          break;

        case 601:
          messageShow("\nAre you ready for this?\nIt's time for a duel of ages.");
          // Initialize the Sprites in a "walking up" Animation.
          charWalkUp.apply(mainSprite1).apply(mainSprite2);
          mainSprite1.display(416, 640);
          mainSprite2.display(480, 640);

          // Animate the characters moving into position.
          mainSprite1.moveTo(416, 432, function() {
            charWalkUp.stop(mainSprite1, charWalkLeft);
            mainSprite1.moveTo(384, 400, function() {
              messageShow("\nTwo enter the caldera, and two will probably exit it.");
              mainSprite1.moveTo(352, 400, function() {
                charWalkLeft.stop(mainSprite1, charWalkUp);
                mainSprite1.moveTo(304, 352, function() {
                  mainSprite1.moveTo(304, 304, function() {
                    mainSprite1.moveTo(240, 240, function() {
                      messageShow("\nYou know, unless someone trips or something.");
                      mainSprite1.moveTo(240, 208, function() {
                        charWalkUp.stop(mainSprite1, charWalkRight);
                        mainSprite1.moveTo(256, 192, function() {
                          mainSprite1.moveTo(304, 192, function() {
                            mainSprite1.moveTo(368, 224, function() {
                              mainSprite1.moveTo(384, 224, function() {
                                charWalkRight.stop(mainSprite1, charStandRight);
                                levelStart(602);
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          mainSprite2.moveTo(480, 432, function() {
            charWalkUp.stop(mainSprite2, charWalkRight);
            mainSprite2.moveTo(512, 400, function() {
              mainSprite2.moveTo(544, 400, function() {
                charWalkRight.stop(mainSprite2, charWalkUp);
                mainSprite2.moveTo(592, 352, function() {
                  mainSprite2.moveTo(592, 304, function() {
                    mainSprite2.moveTo(656, 240, function() {
                      mainSprite2.moveTo(656, 208, function() {
                        charWalkUp.stop(mainSprite2, charWalkLeft);
                        mainSprite2.moveTo(640, 192, function() {
                          mainSprite2.moveTo(592, 192, function() {
                            mainSprite2.moveTo(528, 224, function() {
                              mainSprite2.moveTo(512, 224, function() {
                                charWalkLeft.stop(mainSprite2, charStandLeft);
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          break;

        case 602:
          messageShow("\nIt's time for Pong 2.5D!\n(put on your 2.5D goggles)");
          setTimeout(function() { levelStart(700); }, 2000);
          break;

        case 700:
          // Defaults in case of re-entry.
          bgmPlay("showdown");
          applyBG("img/Caldera.png", null, 4);
          $playarea.css("opacity", 1);
          charStandRight.apply(mainSprite1);
          charStandLeft.apply(mainSprite2);
          mainSprite1.display(384, 224);
          mainSprite2.display(512, 224);

          mePongPoints.set(0);
          mePongPoints.display(790, 324, 75);
          otherPongPoints.set(0);
          otherPongPoints.display(790, 284, 55);

          messageShow("Control the paddle with the mouse.\nUse the a/d keys to angle the paddle left or right.\nFirst to 11 points conquers the caldera of Mt. Vulcan!");

          pongShow(mePongPoints, otherPongPoints, level, function(vic) {
            meVictory = vic;
            levelStart(1700, vic ? "I won!" : "I lost...");
          }, function(otherLevel) {
            // In the event of the opponent moving on, we have to try and figure
            // out what happened. Either the opponent missed or the ball went
            // off the board. Luckily we can figure out the second case with
            // information on hand.
            meVictory = $pongball.data("zvel") > 0;
            var yvel = $pongball.data("yvel");
            // t = (-(-yvel) + sqrt(yvel^2 - 4*1.25*ypos))/2*1.25
            var t = (yvel+Math.sqrt(yvel*yvel + 5*$pongball.data("ypos"))) / 2.5;
            var xt = $pongball.data("xpos") + t * $pongball.data("xvel");
            if (xt < 0 || xt > 480) {
              var zt = $pongball.data("zpos") + t * $pongball.data("zvel");
              if ($pongball.data("zvel") > 0 && zt < 100) {
                meVictory = false;
              }
              else if ($pongball.data("zvel") < 0 && zt > -100) {
                meVictory = true;
              }
            }
            levelStart(1700, meVictory ? "I won!" : "I lost...");
          });
          break;

        case 1300:
          applyBG("img/Pass.png", "img/Pass%20[upper].png");
          $playarea.css("opacity", 1);
          roshambolivoHide();
          mainFace1.hide();
          mainFace2.hide();
          hpMeter1.hide();
          hpMeter2.hide();
          hpMeter3.hide();
          faceSprite1.hide();

          bgmStop();
          if (action == "I won!") {
            bgmPlay("victory");
            messageShow("\nA winner is you!\nBut wouldn't it feel better to get to the top, then win?");
          }
          else {
            sePlay("loss");
            messageShow("\nA loser is you!\nHe was only trying to help!");
          }
          break;

        case 1500:
          applyBG("img/Bridge.png", "img/Bridge%20[upper].png");
          $playarea.css("opacity", 1);
          roshambolivoHide();
          mainFace1.hide();
          mainFace2.hide();
          hpMeter1.hide();
          hpMeter2.hide();
          hpMeter3.hide();
          hpMeter4.hide();
          hpMeter5.hide();
          faceSprite1.hide();
          faceSprite2.hide();
          faceSprite3.hide();

          bgmStop();
          if (action == "I won!") {
            bgmPlay("victory");
            messageShow("\nA winner is you!\nDid you make it to the top of the mountain?");
          }
          else {
            sePlay("loss");
            messageShow("\nA loser is you!\nTry again and don't drink the fruit juice this time!");
          }
          break;

        case 1700:
          applyBG("img/Caldera.png", null, 4);
          $playarea.css("opacity", 1);
          pongHide();
          charStandRight.apply(mainSprite1);
          charStandLeft.apply(mainSprite2);
          mainSprite1.display(384, 224);
          mainSprite2.display(512, 224);
          mePongPoints.hide();
          otherPongPoints.hide();
          bgmStop();
          if (action == "I won!") {
            bgmPlay("victory");
            messageShow("\nA winner is you!\nHooray! Can I have the job now?");
            charStandDown.apply(meSprite);
          }
          else {
            sePlay("loss");
            messageShow("\nA loser is you!\nMaybe you should try playing against someone else.");
            charStandDown.apply(otherSprite);
          }
          break;

      }
    };

    // Wait until the other player has caught up.
    // But don't bother if we've already reached the end of the game.
    if (!first && level >= 1000) {
      $.ajax({url:"action.php",data:{me:meName,level:level,action:action}});
      successFunction(level, action == "I won!" ? "I lost..." : "I won!");
    }
    else {
      var waitTime = 0;
      $otherThrobber.css({display: "block", opacity: 0})
      var waitFunction = function(data) {
        if (debug && waitTime++ == 20) {
          alert(level);
          alert(data);
        }
        var parts = data.split("|");
        // Wait until the other player is at least up to our level.
        if ((parts[0] < level && parts[0] % 10 < level % 10) || parts[0] / 100 < level / 100 || parts[0] > 1000 && parts[0] != level) {
          $otherThrobber.animate({opacity: 1}, throbberFade);
          setTimeout(function() {
            $.ajax({url:"action.php",data:{me:meName},success:waitFunction});
          }, interactionWaitTime);
        }
        else {
          $otherThrobber.animate({opacity: 0}, throbberFade, function() { $otherThrobber.css({display: "none"}) });
          successFunction(parts[0], parts[1]);
        }
      };

      $.ajax({url:"action.php",data:{me:meName,level:level,action:action},success:waitFunction});
    }
  };

  return levelStart;
}
