document.addEventListener('DOMContentLoaded', function () {
  var article = document.querySelector('article.typeset');
  if (!article) return;
  if (article.querySelector('.metadata-form')) return;

  // Column width specs for walkthrough tables (no-op on other pages)
  var colW = {
    'sub': '52px', 'ses': '52px', 'run': '52px',
    'task_name': '190px',
    'path_to_emg_file': '195px', 'path_to_labels_file': '210px',
    'name': '82px', 'type': '95px', 'units': '62px',
    'description': '300px',
    'parent_coord_system': '128px', 'anchor_electrode': '115px',
    'anchor_x': '74px', 'anchor_y': '74px', 'anchor_z': '74px',
    'channel_name': '98px', 'electrode_name': '105px',
    'x': '52px', 'y': '52px', 'z': '52px',
    'coordinate_system': '112px',
    'reference': '82px', 'group': '72px',
    'target_muscle': '158px',
    'material': '78px', 'impedance': '78px',
    'low_cutoff': '82px', 'high_cutoff': '82px',
    'setup': '80px', 'setup_name': '95px'
  };

  // Wrap all tables in scroll containers and apply column widths
  article.querySelectorAll('table').forEach(function (table) {
    if (table.closest('.wt-table-scroll') || table.closest('.table-scroll')) return;
    var ths = table.querySelectorAll('thead th');
    ths.forEach(function (th) {
      var key = th.textContent.trim().toLowerCase().replace(/\s+/g, '_');
      if (colW[key]) th.style.minWidth = colW[key];
    });
    var wrap = document.createElement('div');
    wrap.className = 'wt-table-scroll';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // Build TOC from headings
  var headings = article.querySelectorAll('h2, h3, h4');
  if (headings.length === 0) return;

  var nav = document.createElement('nav');
  nav.id = 'wt-toc';
  nav.innerHTML = '<ul></ul>';
  var ul = nav.querySelector('ul');

  var currentH3Ul = null;

  headings.forEach(function (h, i) {
    if (!h.id) h.id = 'wt-s' + i;
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);

    if (h.tagName === 'H2') {
      li.className = 'wt-toc-h2';
      ul.appendChild(li);
      currentH3Ul = null;
    } else if (h.tagName === 'H3') {
      li.className = 'wt-toc-h3';
      ul.appendChild(li);
      var subUl = document.createElement('ul');
      subUl.className = 'wt-toc-h4-list';
      li.appendChild(subUl);
      currentH3Ul = subUl;
      (function (su, anchor) {
        anchor.addEventListener('click', function () {
          if (su.children.length === 0) return;
          var isOpen = su.classList.contains('open');
          su.classList.toggle('open', !isOpen);
          anchor.classList.toggle('expanded', !isOpen);
        });
      })(subUl, a);
    } else if (h.tagName === 'H4') {
      li.className = 'wt-toc-h4';
      if (currentH3Ul) {
        currentH3Ul.appendChild(li);
        var parentA = currentH3Ul.parentElement.querySelector(':scope > a');
        if (parentA) parentA.classList.add('has-children');
      }
    }
  });

  // Inject two-column wrapper
  var wrapper = document.createElement('div');
  wrapper.id = 'wt-wrapper';
  article.parentNode.insertBefore(wrapper, article);
  wrapper.appendChild(nav);
  wrapper.appendChild(article);


  // Highlight active section on scroll
  var links = nav.querySelectorAll('a');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('active'); });
        var active = nav.querySelector('a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-5% 0px -80% 0px' });

  headings.forEach(function (h) { observer.observe(h); });

  // Tabbed code blocks
  article.querySelectorAll('.code-tabs').forEach(function (tabs) {
    var panes = tabs.querySelectorAll('.tab-pane');
    var labelBar = document.createElement('div');
    labelBar.className = 'tab-labels';
    panes.forEach(function (pane, i) {
      var btn = document.createElement('button');
      btn.className = 'tab-label' + (i === 0 ? ' active' : '');
      btn.textContent = pane.getAttribute('data-label');
      btn.addEventListener('click', function () {
        panes.forEach(function (p) { p.classList.remove('active'); });
        labelBar.querySelectorAll('.tab-label').forEach(function (b) { b.classList.remove('active'); });
        pane.classList.add('active');
        btn.classList.add('active');
      });
      labelBar.appendChild(btn);
      if (i === 0) pane.classList.add('active');

      // Syntax highlighting (scoped — avoids re-processing Rouge blocks)
      var codeEl = pane.querySelector('code');
      if (codeEl && typeof hljs !== 'undefined') hljs.highlightElement(codeEl);

      // Copy button
      var copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', function () {
        var code = pane.querySelector('code');
        if (!code) return;
        navigator.clipboard.writeText(code.innerText).then(function () {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
      pane.style.position = 'relative';
      pane.appendChild(copyBtn);
    });
    tabs.insertBefore(labelBar, tabs.firstChild);
  });
});
