// ==UserScript==
// @name Saner Dev Doc Index
// @namespace Violentmonkey Scripts
// @match https://www.odoo.com/documentation/*/index.html
// @grant none
// ==/UserScript==

$(document).ready(function () {
    'tutorials, api, setting_up, reference'.split(', ').forEach(section => {
      section = $(`.toc-section.${section}`)
      var links = section.find('a.card-img').removeClass('card-img').detach();
      section.find('figure.card').parent('div').remove()
      
      var list = $('<ul></ul>')
      for(var i=0; i<links.length; i++) {
        var link = $(links[i])
        var text = link.find('figcaption').text()
        link.find('span').remove()
        link.find('figcaption').remove()
        link.text(text)
        link = $('<li></li>').append(link)
        list.append(link)
      }
      section.append(list)
    });
  })
  