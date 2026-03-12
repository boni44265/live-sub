(function () {
  'use strict';

  var YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3/channels';
  var MIN_REFRESH_INTERVAL = 2;
  var DEFAULT_REFRESH_INTERVAL = 5;
  var MAX_ANIMATION_STEPS = 30;

  // DOM references
  var setupPanel = document.getElementById('setup-panel');
  var counterPanel = document.getElementById('counter-panel');
  var setupForm = document.getElementById('setup-form');
  var apiKeyInput = document.getElementById('api-key');
  var channelIdInput = document.getElementById('channel-id');
  var refreshInput = document.getElementById('refresh-interval');
  var subscriberCountEl = document.getElementById('subscriber-count');
  var channelNameEl = document.getElementById('channel-name');
  var channelAvatarEl = document.getElementById('channel-avatar');
  var stopBtn = document.getElementById('stop-btn');
  var errorEl = document.getElementById('error-message');

  var timerId = null;
  var isOverlayMode = false;

  // ---- Helpers ----

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  function hideError() {
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
  }

  function buildApiUrl(apiKey, channelId) {
    return (
      YOUTUBE_API_BASE +
      '?part=statistics,snippet&id=' +
      encodeURIComponent(channelId) +
      '&key=' +
      encodeURIComponent(apiKey)
    );
  }

  function buildHandleApiUrl(apiKey, handle) {
    return (
      YOUTUBE_API_BASE +
      '?part=statistics,snippet&forHandle=' +
      encodeURIComponent(handle) +
      '&key=' +
      encodeURIComponent(apiKey)
    );
  }

  function formatNumber(num) {
    return Number(num).toLocaleString();
  }

  function isHandle(input) {
    return input.length > 0 && input.charAt(0) === '@';
  }

  function getUrlParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      key: params.get('key') || '',
      channel: params.get('channel') || '',
      interval: parseInt(params.get('interval'), 10) || DEFAULT_REFRESH_INTERVAL
    };
  }

  // ---- Core logic ----

  function fetchSubscriberCount(apiKey, channelInput) {
    var url = isHandle(channelInput)
      ? buildHandleApiUrl(apiKey, channelInput)
      : buildApiUrl(apiKey, channelInput);

    return fetch(url)
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (err) {
            var msg =
              err && err.error && err.error.message
                ? err.error.message
                : 'YouTube API request failed (HTTP ' + response.status + ')';
            throw new Error(msg);
          });
        }
        return response.json();
      })
      .then(function (data) {
        if (!data.items || data.items.length === 0) {
          throw new Error('Channel not found. Please check the Channel ID or handle.');
        }

        var channel = data.items[0];
        return {
          name: channel.snippet.title,
          avatar: channel.snippet.thumbnails.default.url,
          subscribers: channel.statistics.subscriberCount,
          hiddenCount: channel.statistics.hiddenSubscriberCount
        };
      });
  }

  function animateCount(el, targetValue) {
    var current = parseInt(el.textContent.replace(/,/g, ''), 10) || 0;
    var target = parseInt(targetValue, 10) || 0;

    if (current === target) return;

    var diff = target - current;
    var steps = Math.min(Math.abs(diff), MAX_ANIMATION_STEPS);
    var stepValue = diff / steps;
    var step = 0;

    function tick() {
      step++;
      if (step >= steps) {
        el.textContent = formatNumber(target);
        return;
      }
      var value = Math.round(current + stepValue * step);
      el.textContent = formatNumber(value);
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function updateDisplay(info) {
    channelNameEl.textContent = info.name;
    channelAvatarEl.src = info.avatar;
    channelAvatarEl.alt = info.name + ' avatar';

    if (info.hiddenCount) {
      subscriberCountEl.textContent = 'Hidden';
    } else {
      animateCount(subscriberCountEl, info.subscribers);
    }
  }

  function startPolling(apiKey, channelId, intervalSec) {
    stopPolling();
    function poll() {
      fetchSubscriberCount(apiKey, channelId)
        .then(function (info) {
          hideError();
          updateDisplay(info);
        })
        .catch(function (err) {
          showError(err.message);
        });
    }

    // Fetch immediately, then on interval
    poll();
    timerId = setInterval(poll, intervalSec * 1000);
  }

  function stopPolling() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function enableOverlayMode() {
    isOverlayMode = true;
    document.body.classList.add('overlay-mode');
  }

  // ---- Event handlers ----

  setupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError();

    var apiKey = apiKeyInput.value.trim();
    var channelId = channelIdInput.value.trim();
    var interval = parseInt(refreshInput.value, 10);

    if (!apiKey || !channelId) {
      showError('Please fill in both the API Key and Channel ID.');
      return;
    }

    if (isNaN(interval) || interval < MIN_REFRESH_INTERVAL) {
      interval = DEFAULT_REFRESH_INTERVAL;
    }

    // Do a one-off fetch first to validate inputs before switching view
    fetchSubscriberCount(apiKey, channelId)
      .then(function (info) {
        setupPanel.classList.add('hidden');
        counterPanel.classList.remove('hidden');
        updateDisplay(info);
        startPolling(apiKey, channelId, interval);
      })
      .catch(function (err) {
        showError(err.message);
      });
  });

  stopBtn.addEventListener('click', function () {
    stopPolling();
    counterPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
    subscriberCountEl.textContent = '0';
    hideError();
  });

  // ---- OBS Overlay: auto-start from URL parameters ----

  var urlParams = getUrlParams();
  if (urlParams.key && urlParams.channel) {
    enableOverlayMode();

    var interval = urlParams.interval;
    if (isNaN(interval) || interval < MIN_REFRESH_INTERVAL) {
      interval = DEFAULT_REFRESH_INTERVAL;
    }

    setupPanel.classList.add('hidden');
    counterPanel.classList.remove('hidden');

    fetchSubscriberCount(urlParams.key, urlParams.channel)
      .then(function (info) {
        updateDisplay(info);
        startPolling(urlParams.key, urlParams.channel, interval);
      })
      .catch(function (err) {
        showError(err.message);
      });
  }
})();
