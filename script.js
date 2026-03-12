(function () {
  'use strict';

  var YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3/channels';
  var MIN_REFRESH_INTERVAL = 2;

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

  function formatNumber(num) {
    return Number(num).toLocaleString();
  }

  // ---- Core logic ----

  function fetchSubscriberCount(apiKey, channelId) {
    var url = buildApiUrl(apiKey, channelId);

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
          throw new Error('Channel not found. Please check the Channel ID.');
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

  function updateDisplay(info) {
    channelNameEl.textContent = info.name;
    channelAvatarEl.src = info.avatar;
    channelAvatarEl.alt = info.name + ' avatar';

    if (info.hiddenCount) {
      subscriberCountEl.textContent = 'Hidden';
    } else {
      subscriberCountEl.textContent = formatNumber(info.subscribers);
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
      interval = 5;
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
})();
