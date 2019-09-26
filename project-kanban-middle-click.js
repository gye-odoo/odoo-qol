// ==UserScript==
// @name Project Kanban Middle Click and Ctrl+Click
// @namespace Violentmonkey Scripts
// @match https://www.odoo.com/web*&model=project.task*view_type=kanban*
// @grant none
// ==/UserScript==

idNameCache = {}

// Intercept XMLHttpRequest to find search_read result to get task IDs and map them to names
// Note: If the DOM included task ID, none of this would have been necessary
$(document).ready(() => {
  (function(open) {
    XMLHttpRequest.prototype.open = function() {
      this.addEventListener("readystatechange", function() {
        if (this.responseURL.includes('web/dataset/search_read') && this.response) {
          // Don't extract ID here (don't want to bloat XMLHttpRequest), fire an event so it's handled elsewhere.
          document.dispatchEvent(
            new CustomEvent('search_read', {detail: {responseText: this.response, url: this.responseURL}})
          )
        }
      }, false);
      open.apply(this, arguments);
    };
  })(XMLHttpRequest.prototype.open);
})

document.addEventListener('search_read', data => {
  var response = null
  try {
    console.log(data.detail.url)
    response = JSON.parse(data.detail.responseText)
  } catch(e) {}
  if (response && response.result) {
    var records = response.result.records
    for(var i=0; i<records.length; i++) {
      idNameCache[records[i].name] = records[i].id
    }
  }
})

// Construct url for individual task_id
function getTaskUrl(task_id) {
  var l = window.location
  var params = l.hash.slice(1).split('&').map(p => p.split('='))
  params = Object.fromEntries((params))
  params.id = task_id
  params.view_type = "form"
  var hash = '#' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  return l.origin + l.pathname + l.search + hash
}

// Find all cards and bind middle-click (and Ctrl + click) to open the task in a new tab
function doStuff() {
  var cards = $('.oe_kanban_card.o_kanban_record').each(function() {
    var card = $(this)
    var title = card.find('.o_kanban_record_headings .o_kanban_record_title span').html()
    card.mousedown(function(ev) {
      if (ev.which === 2 || (ev.ctrlKey && ev.which === 1)) {
        const task_id = idNameCache[title]
        if (task_id) {
          if (ev.which === 1) {
            ev.stopPropagation()
          }
          window.open(getTaskUrl(task_id), '_blank');
        } else {
          alert(`Couldn't retrieve task ID for: ${title}`)
        }
      }
    })
  })
}

// Wait for ajax content to load and call the actual function
window.onload = function() {
  var timer = setInterval(() => {
    if ($('.o_kanban_view').length != 0) {
      clearInterval(timer)
      doStuff()
    }
  }, 500)
}
