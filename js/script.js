/* ===== cpf-main-js-extra ===== */
var cpfSite = {"restBase":"https://corsspointinfo.test/wp-json/crosspoint/v1/","nonce":"ee86272064","ts":"1794378316","waBase":"https://wa.me/14374346994?text=Hi%20CrossPoint%2C%20I%20would%20like%20to%20speak%20with%20an%20advisor.","calendlyUrl":"https://calendly.com/crosspointformations/intro-call","confirm":{"title":"Are you sure?","ok":"Yes, continue","cancel":"Cancel"}};

/* ===== cpf-main-js ===== */
/**
 * CrossPoint - main.js
 * Site-wide behaviour: mega menu, mobile menu, scroll reveal and the homepage
 * contact form.
 *
 * Vanilla JS only - jQuery is never a dependency of this theme.
 * Analytics and conversion tracking are deliberately absent: a tag manager or
 * analytics plugin owns them, so the theme never loads a second gtag or fires
 * a duplicate conversion.
 */
var cpfSite = window.cpfSite || {};


/* ---------- Mega menu: hover on desktop, tap on touch ---------- */
/* mega-menu: hover on desktop (CSS), tap-to-toggle on touch, click-away to close */
  (function(){
    var megas=document.querySelectorAll('.nav-mega');
    megas.forEach(function(m){
      var t=m.querySelector('.nav-mega-trigger');
      t.addEventListener('click',function(e){
        e.stopPropagation();
        var open=m.classList.contains('open');
        megas.forEach(function(x){x.classList.remove('open');x.querySelector('.nav-mega-trigger').setAttribute('aria-expanded','false');});
        if(!open){m.classList.add('open');t.setAttribute('aria-expanded','true');}
      });
    });
    document.addEventListener('click',function(){megas.forEach(function(x){x.classList.remove('open');x.querySelector('.nav-mega-trigger').setAttribute('aria-expanded','false');});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')megas.forEach(function(x){x.classList.remove('open');x.querySelector('.nav-mega-trigger').setAttribute('aria-expanded','false');});});
  })();

/* ---------- Sticky header: lift the bar off the page once it has scrolled ---------- */
( function () {
	'use strict';

	var header = document.querySelector( '.nav--sticky' );
	var ticking = false;

	if ( ! header ) {
		return;
	}

	function update() {
		header.classList.toggle( 'is-scrolled', window.scrollY > 8 );
		ticking = false;
	}

	// One class change per frame, however many scroll events arrive in it.
	window.addEventListener( 'scroll', function () {
		if ( ! ticking ) {
			ticking = true;
			window.requestAnimationFrame( update );
		}
	}, { passive: true } );

	update();
}() );

/* ---------- Mobile menu ---------- */
var burger = document.getElementById('burger');
var menu = document.getElementById('mobileMenu');
if (burger && menu) {
  burger.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  /* One way to close, so a link, Escape and the button all leave the burger
     saying the same thing. Closing from a link used to leave it labelled
     "Close menu" on a closed menu. */
  var closeMobileMenu = function () {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  };

  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMobileMenu);
  });

  // Escape closes it, as it does every other menu on the site, and hands focus
  // back to the button so a keyboard user is not left inside a hidden panel.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMobileMenu();
      burger.focus();
    }
  });

  /* Collapsible sections.

     The walker renders every panel open, so a browser without JavaScript gets
     the whole menu rather than a row of buttons that do nothing. Closing them
     is the first thing done here - only once there is something to reopen them
     with. */
  var mmToggles = Array.prototype.slice.call(menu.querySelectorAll('.mm-toggle'));

  function mmPanelOf(btn) {
    return document.getElementById(btn.getAttribute('aria-controls'));
  }

  function mmClose(btn) {
    var panel = mmPanelOf(btn);

    if (panel) {
      panel.hidden = true;
    }

    btn.setAttribute('aria-expanded', 'false');
  }

  mmToggles.forEach(function (btn) {
    mmClose(btn);

    btn.addEventListener('click', function () {
      var panel = mmPanelOf(btn);

      if (!panel) {
        return;
      }

      var opening = panel.hidden;

      /* One at a time. These panels run to a dozen links each, and two open
         together pushes everything below them off the screen. */
      mmToggles.forEach(function (other) {
        if (other !== btn) {
          mmClose(other);
        }
      });

      panel.hidden = !opening;
      btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });
  });
  }

/* ---------- Contact forms ---------- */
/* Posts to the same lead endpoint as the quiz and the wizard, with source
   "contact", so every enquiry lands in one place.

   Every lead form on the site is bound here, not just the homepage one. A form
   left unbound falls back to a native submit, and because it has no action it
   GETs the current URL - which lands on a 404 the moment a field is called
   "name", since WordPress reads ?name= as a post slug. */
/* The lead forms carry novalidate, so the browser's own type="email" check
   never runs. Without a check here a malformed address is only caught at the
   endpoint, and comes back as a generic "could not send" that says nothing
   about which field was wrong.

   Deliberately loose - one @, a dot in the domain, no spaces. Anything
   stricter starts rejecting real addresses, and is_email() on the server
   remains the authority on what is stored. */
var CPF_EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/* A format check cannot catch a well-formed address at a domain that does not
   exist, which is what a hard bounce usually is. These are the misspellings
   common enough to be worth querying before the lead is stored. */
var CPF_DOMAIN_TYPOS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'yahoo.con': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'iclould.com': 'icloud.com',
  'icloud.con': 'icloud.com'
};

/* The same address with a corrected domain, or '' when nothing looks wrong. */
function cpfEmailTypo( email ) {
  var at = email.lastIndexOf( '@' );

  if ( at < 0 ) {
    return '';
  }

  var fixed = CPF_DOMAIN_TYPOS[ email.slice( at + 1 ).toLowerCase() ];

  return fixed ? email.slice( 0, at + 1 ) + fixed : '';
}

function cpfBindLeadForm( leadForm ) {
  if ( ! leadForm ) {
    return;
  }

  leadForm.addEventListener( 'submit', function ( e ) {
    e.preventDefault();

    var btn = leadForm.querySelector( '[type="submit"]' );
    var original = btn ? btn.textContent : '';
    var note = leadForm.querySelector( '.cpf-form-note' ) ||
      leadForm.querySelector( '.usm-lf-msg' ) ||
      document.getElementById( 'cf-msgout' );

    /* A visible note beats an alert the visitor may have blocked. The landing
       forms have carried a note element all along but were not matched here,
       so every error on those pages arrived as an alert. */
    function cpfNote( text ) {
      if ( ! note ) {
        window.alert( text );

        return;
      }

      note.textContent = text;
      note.hidden = false;
      note.className = ( note.className || '' ).replace( /\s*is-error/, '' ) + ' is-error';
    }

    function cpfResetButton() {
      if ( btn ) {
        btn.disabled = false;
        btn.textContent = original;
      }
    }

    if ( btn ) {
      btn.disabled = true;
      btn.textContent = 'Sending\u2026';
    }

    /* Hidden again on each attempt: a stale error above a form that is now
       sending reads as if the send had already failed. */
    if ( note ) {
      note.textContent = '';
      note.hidden = true;
    }

    var form = new FormData( leadForm );
    var emailField = leadForm.querySelector( '[name="email"]' );
    var emailValue = String( form.get( 'email' ) || '' ).trim();

    if ( ! CPF_EMAIL_RE.test( emailValue ) ) {
      cpfResetButton();
      cpfNote( 'That email address does not look right. Please check it and send again.' );

      if ( emailField ) {
        emailField.focus();
      }

      return;
    }

    /* Queried once per address. If the visitor sends the same one again they
       mean it, and a genuine mailbox at an unusual domain must never become
       unsubmittable over a guess. */
    var suggestion = cpfEmailTypo( emailValue );

    if ( suggestion && leadForm.getAttribute( 'data-cpf-email-asked' ) !== emailValue ) {
      leadForm.setAttribute( 'data-cpf-email-asked', emailValue );
      cpfResetButton();
      cpfNote( 'Did you mean ' + suggestion + '? Correct the address if so, or send again to use it as typed.' );

      if ( emailField ) {
        emailField.focus();
      }

      return;
    }

    /* Permission to make contact. The box carries required, so a browser stops
       this before submit ever fires; forms with novalidate do not, and the
       endpoint refuses either way. Saying so here is what turns that refusal
       into something the visitor can act on. */
    var consentBox = leadForm.querySelector( '.cpf-consent-box' );

    if ( consentBox && ! consentBox.checked ) {
      cpfResetButton();
      cpfNote( 'Please tick the box to say we may contact you about your enquiry.' );
      consentBox.focus();

      return;
    }

    var company = form.get( 'company_name' ) || '';
    var payload = {
      /* The FilingGuard form asks for a company rather than a person, so the
         company names the lead. The endpoint requires full_name, and refusing a
         real sign-up over a field that form never asks for would be absurd. */
      full_name: form.get( 'full_name' ) || form.get( 'name' ) || company || '',
      email: form.get( 'email' ) || '',
      whatsapp: form.get( 'whatsapp_number' ) || form.get( 'whatsapp' ) || '',
      residence_country: form.get( 'country_of_residence' ) || form.get( 'country' ) || '',
      business_type: form.get( 'business_type' ) || '',
      structure: form.get( 'company_interest' ) || form.get( 'interested_in' ) || form.get( 'structure' ) || '',
      company_name: company,
      state: form.get( 'state' ) || '',
      owners: form.get( 'owners' ) || '',
      message: form.get( 'message' ) || '',
      /* Each form declares its own source in a hidden field, so one handler
         serves them all and the lead lands under the right recipient list. */
      source: form.get( 'source' ) || 'contact',
      consent: consentBox ? 'yes' : '',
      source_url: location.href,
      /* The honeypot is named differently in each template; the endpoint reads
         one field, so every spelling has to be collected here or that form
         submits with an empty trap and catches no bots. */
      website: form.get( 'website' ) || form.get( '_gotcha' ) || form.get( 'cpf_hp_field' ) || '',
      ts: cpfSite.ts || 0
    };

    fetch( ( cpfSite.restBase || '/wp-json/crosspoint/v1/' ) + 'lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cpfSite.nonce || '' },
      body: JSON.stringify( payload )
    } )
      .then( function ( r ) {
        return r.json().then(
          function ( d ) { return { r: r, d: d }; },
          function () { return { r: r, d: null }; }
        );
      } )
      .then( function ( out ) {
        var d = out.d;

        /* The body, not only the status, says whether the lead was taken. When
           it was refused the server says why - too many requests, the consent
           box, an expired session - and that is what the visitor needs to read. */
        if ( d && 'rest_cookie_invalid_nonce' === d.code ) {
          throw cpfServerError( 'Your session expired \u2014 please reload the page and try again.' );
        }

        if ( ! out.r.ok || ! d || ! d.ok ) {
          throw cpfServerError( d && 'string' === typeof d.message ? d.message : '' );
        }

        /* A form may ship its own confirmation panel, named in data-cpf-done.
           The landing pages carry one with a WhatsApp follow-up, which is worth
           far more than a generic tick at the moment intent is highest.
           Overwriting the form's innerHTML would throw that panel away. */
        var doneId = leadForm.getAttribute( 'data-cpf-done' );
        var done = doneId ? document.getElementById( doneId ) : null;

        if ( done ) {
          leadForm.hidden = true;
          done.hidden = false;
          /* Focus moves to the panel so a screen reader announces the result
             rather than leaving the reader on a form that just vanished. */
          done.setAttribute( 'tabindex', '-1' );
          done.focus( { preventScroll: true } );
          done.scrollIntoView( { behavior: 'smooth', block: 'center' } );

          return;
        }

        leadForm.innerHTML = '<div class="cpf-form-done">' +
          '<div class="cpf-form-done__tick">\u2713</div>' +
          '<h3>Message sent</h3>' +
          '<p>Thanks \u2014 we usually reply within one business day.</p></div>';
        leadForm.scrollIntoView( { behavior: 'smooth', block: 'center' } );
      } )
      .catch( function ( err ) {
        cpfResetButton();
        cpfNote( ( err && err.cpfServer && err.message ) || 'We could not send your message. Please try again, or message us on WhatsApp.' );
      } );
  } );
}

/**
 * An error carrying the server's own explanation, as opposed to one thrown by
 * the browser (a network failure, a body that was not JSON).
 *
 * @param {string} message Text from the server; may be empty.
 * @return {Error} The error, marked as the server's.
 */
function cpfServerError( message ) {
  var e = new Error( message );

  e.cpfServer = true;

  return e;
}

[ 'contact-form', 'cform', 'usmLead', 'fgLead' ].forEach( function ( id ) {
  cpfBindLeadForm( document.getElementById( id ) );
} );

/* ---------- Scroll reveal ---------- */
(function(){
  try{
    if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var els=[];
    document.querySelectorAll('section:not(.pricing)').forEach(function(s){els.push(s)});
    var pr=document.querySelector('section.pricing');
    if(pr){
      var k=pr.querySelector('.kicker'),h=pr.querySelector('h2'),n=pr.querySelector('.price-note');
      if(k)els.push(k); if(h)els.push(h);
      pr.querySelectorAll('.plan').forEach(function(pl,i){pl.style.transitionDelay=(i*110)+'ms';els.push(pl)});
      if(n)els.push(n);
    }
    els.forEach(function(e){e.classList.add('rv')});
    /* threshold 0, not 0.1. The ratio is of the element, not the viewport, so a
       section taller than about ten screens can never show 10% of itself at
       once - the callback never fires, .rv-in is never added, and the page sits
       at opacity 0 forever. The long guides are single sections of exactly that
       size, so they rendered blank. Any intersection is enough to reveal. */
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(en){if(en.isIntersecting){en.target.classList.add('rv-in');io.unobserve(en.target)}});
    },{threshold:0,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(e){io.observe(e)});
    /* Anything already on screen at load must not wait for a scroll that may
       never come on a short page. */
    requestAnimationFrame(function(){
      els.forEach(function(e){
        var r=e.getBoundingClientRect();
        if(r.top<(window.innerHeight||0)&&r.bottom>0){e.classList.add('rv-in');io.unobserve(e)}
      });
    });
  }catch(e){document.querySelectorAll('.rv').forEach(function(x){x.classList.add('rv-in')})}
})();

/* ---------- Header account menu ----------
 * The menu is a <details> element, so opening, closing and the keyboard all
 * work on their own. The two things <details> does not do are close when the
 * page is clicked elsewhere and close on Escape, which is what people expect of
 * a menu. It lives in main.js rather than account.js because the menu is in the
 * header of every page, while account.js only loads on the portal. */
(function () {
  var menu = document.querySelector('[data-cpf-account-menu]');

  if (!menu) { return; }

  document.addEventListener('click', function (event) {
    if (menu.open && !menu.contains(event.target)) { menu.open = false; }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
}());

/* ---------- Skip link ----------
 * "Skip to content" only changes the URL's #hash. A <main> cannot take focus on
 * its own, so focus stayed on the page itself: Chrome carries on tabbing from
 * the right place, but Safari and screen readers announce nothing and the next
 * Tab can land back in the menu. Moving focus onto <main> makes the jump real
 * everywhere. tabindex -1 lets script focus it without adding a Tab stop. */
(function () {
  var link = document.querySelector('.cpf-skip-link');

  if (!link) { return; }

  link.addEventListener('click', function () {
    var target = document.getElementById((link.getAttribute('href') || '').replace(/^#/, ''));

    if (!target) { return; }

    if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }

    target.focus();
  });
}());

/* ---------- Confirm popup ----------
 * Anything carrying data-cpf-confirm="Question?" asks first, in a popup centred
 * on the page rather than the browser's own confirm box. On a button or link
 * the click asks; on a form the submit does. Without script the action simply
 * goes ahead, as it always did. A native <dialog> gives the backdrop, Escape to
 * cancel, and keeps focus inside while it is open. */
(function () {
  var text = (cpfSite && cpfSite.confirm) || {};
  var dialog = null;
  var onYes = null;

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'cpf-confirm';
    dialog.setAttribute('aria-labelledby', 'cpf-confirm-title');
    dialog.setAttribute('aria-describedby', 'cpf-confirm-msg');
    dialog.innerHTML =
      '<form method="dialog" class="cpf-confirm-box">' +
        '<h2 class="cpf-confirm-title" id="cpf-confirm-title"></h2>' +
        '<p class="cpf-confirm-msg" id="cpf-confirm-msg"></p>' +
        '<div class="cpf-confirm-actions">' +
          '<button class="cpf-confirm-cancel" type="submit" value="cancel"></button>' +
          '<button class="cpf-confirm-ok" type="submit" value="ok"></button>' +
        '</div>' +
      '</form>';
    dialog.querySelector('.cpf-confirm-title').textContent = text.title || 'Are you sure?';
    dialog.querySelector('.cpf-confirm-cancel').textContent = text.cancel || 'Cancel';
    dialog.querySelector('.cpf-confirm-ok').textContent = text.ok || 'Yes, continue';

    // A click on the backdrop lands on the dialog itself: treat it as Cancel.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) { dialog.close('cancel'); }
    });

    dialog.addEventListener('close', function () {
      var run = onYes;

      onYes = null;
      if (run && dialog.returnValue === 'ok') { run(); }
    });

    document.body.appendChild(dialog);
  }

  function ask(message, yes) {
    if (!dialog) { build(); }

    // No <dialog> support: fall back to the browser's own question.
    if (typeof dialog.showModal !== 'function') {
      if (window.confirm(message)) { yes(); }
      return;
    }

    dialog.querySelector('.cpf-confirm-msg').textContent = message;
    dialog.returnValue = '';
    onYes = yes;
    dialog.showModal();
    dialog.querySelector('.cpf-confirm-cancel').focus();
  }

  function submitWith(form, button) {
    form.setAttribute('data-cpf-confirmed', '1');

    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit(button || undefined);
      return;
    }

    // Older browsers: carry the button's name and value by hand.
    if (button && button.name) {
      var hidden = document.createElement('input');

      hidden.type = 'hidden';
      hidden.name = button.name;
      hidden.value = button.value;
      form.appendChild(hidden);
    }
    form.submit();
  }

  // Buttons and links.
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-cpf-confirm]') : null;

    if (!el || el.tagName === 'FORM') { return; }

    e.preventDefault();
    ask(el.getAttribute('data-cpf-confirm'), function () {
      if (el.tagName === 'A') {
        window.location.href = el.href;
      } else if (el.form) {
        submitWith(el.form, el);
      }
    });
  });

  // Whole forms.
  document.addEventListener('submit', function (e) {
    var form = e.target;

    if (!form.hasAttribute || !form.hasAttribute('data-cpf-confirm')) { return; }

    if (form.getAttribute('data-cpf-confirmed')) {
      form.removeAttribute('data-cpf-confirmed');
      return;
    }

    e.preventDefault();
    ask(form.getAttribute('data-cpf-confirm'), function () {
      submitWith(form, e.submitter);
    });
  }, true);
}());

/* ---------- Submit on change ----------
 * A <select data-cpf-submit-on-change> sends its form as soon as it changes;
 * the form's [data-cpf-nojs] button is the path for a browser without script,
 * so it is hidden here. Used by the company picker on the cart. */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-cpf-submit-on-change]'), function (sel) {
    if (!sel.form) { return; }

    var btn = sel.form.querySelector('[data-cpf-nojs]');

    if (btn) { btn.hidden = true; }

    sel.addEventListener('change', function () { sel.form.submit(); });
  });
}());

/* ---------- Canada province map ----------
 * The /canada-incorporation/compare/ map. Its paths used to call selProv() from
 * inline onclick attributes, but the function never came across in the port,
 * so tapping a province threw and nothing changed. Each province is now a
 * focusable button (role, label and aria-pressed in the template); a click, or
 * Enter or Space, selects it. CrossPoint files provincially in Ontario, British
 * Columbia and Alberta - the same three the /start/ wizard offers - so those
 * lean provincial and every other province leans federal. */
function selProv(code) {
  var map = document.querySelector('.cmp-map');

  if (!map) { return; }

  var path = document.getElementById('p-' + code);
  var name = path ? (path.getAttribute('aria-label') || code) : code;
  var provincial = ['ON', 'BC', 'AB'].indexOf(code) > -1;

  Array.prototype.forEach.call(map.querySelectorAll('.prov'), function (p) {
    var on = (p === path);

    p.classList.toggle('sel', on);
    p.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  var fed = document.getElementById('cmp-fed');
  var prov = document.getElementById('cmp-prov');

  if (fed) { fed.classList.toggle('reco', !provincial); }
  if (prov) { prov.classList.toggle('reco', provincial); }

  var set = function (id, text) {
    var el = document.getElementById(id);

    if (el) { el.textContent = text; }
  };

  set('cmp-selname', 'Showing: ' + name);
  set('fed-for', provincial
    ? 'Choose federal if you will also operate outside ' + name + '.'
    : 'Incorporate federally, then register to operate in ' + name + '.');
  set('prov-for', provincial
    ? 'Simpler and ideal if you will operate only in ' + name + '.'
    : 'We file provincial corporations in Ontario, British Columbia and Alberta.');
  set('cmp-verdict', provincial
    ? 'Operating only in ' + name + '? A ' + name + ' corporation is usually the simpler start. Going national or raising investment? Lean federal. Not sure? We will recommend the right route on a free call.'
    : 'For ' + name + ', federal incorporation is the usual route with us: nationwide name protection, then registration in ' + name + '. Not sure? We will recommend the right route on a free call.');
}

(function () {
  var map = document.querySelector('.cmp-map');

  if (!map) { return; }

  var pick = function (target) {
    var path = target && target.closest ? target.closest('.prov') : null;

    if (path && path.getAttribute('data-code')) { selProv(path.getAttribute('data-code')); }
  };

  map.addEventListener('click', function (e) { pick(e.target); });
  map.addEventListener('keydown', function (e) {
    if ('Enter' !== e.key && ' ' !== e.key && 'Spacebar' !== e.key) { return; }

    e.preventDefault(); // Space would otherwise scroll the page.
    pick(e.target);
  });
}());

/* ---------- U.S. plan cards: line up the Choose buttons ----------
   Each card's foot (the Choose button over the Total today box) sits at the
   bottom of the card, so a box that wraps to an extra line lifts that card's
   button above its neighbours'. The boxes of cards sharing a row are given the
   tallest one's height. Stacked cards, on a phone, are left alone. */
( function () {
	'use strict';

	var grids = document.querySelectorAll( '.cpp-plans' );
	var ticking = false;

	if ( ! grids.length ) {
		return;
	}

	function equalize() {
		ticking = false;

		grids.forEach( function ( grid ) {
			var boxes = grid.querySelectorAll( '.cpp-today' );
			var rows = {};

			boxes.forEach( function ( box ) {
				box.style.minHeight = '';
			} );

			// Group by the card's top edge: cards on one row share it.
			boxes.forEach( function ( box ) {
				var top = Math.round( box.closest( '.cpp-plan' ).getBoundingClientRect().top + window.scrollY );

				if ( ! rows[ top ] ) {
					rows[ top ] = [];
				}

				rows[ top ].push( box );
			} );

			Object.keys( rows ).forEach( function ( top ) {
				var row = rows[ top ];
				var tallest = 0;

				if ( row.length < 2 ) {
					return;
				}

				// The exact height: offsetHeight rounds, which leaves a button a
				// pixel out when the boxes' heights are fractional.
				row.forEach( function ( box ) {
					tallest = Math.max( tallest, box.getBoundingClientRect().height );
				} );

				row.forEach( function ( box ) {
					box.style.minHeight = tallest + 'px';
				} );
			} );
		} );
	}

	function request() {
		if ( ! ticking ) {
			ticking = true;
			window.requestAnimationFrame( equalize );
		}
	}

	equalize();
	window.addEventListener( 'resize', request );
	// Web fonts change where the text wraps once they arrive.
	window.addEventListener( 'load', request );
} )();

/* ===== cpf-quiz-js-extra ===== */
var cpfConfig = {"restBase":"https://corsspointinfo.test/wp-json/crosspoint/v1/","nonce":"ee86272064","ts":"1794378316","source":"home-quiz","packages":{"byKey":{"starter":{"key":"starter","name":"Starter","price":"$29","amount":29,"feeNote":"","detail":"Formation filing only. Add the rest yourself.","ctaLabel":"Choose Starter","ctaUrl":"","badge":"","features":["LLC formation filing","Name availability check","Digital documents","Business logo","Compliance reminders"],"featured":false,"groups":["home","us"],"country":"us","included":["formation","namecheck","docs","logo","reminders"],"required":[],"missing":["ra","ein","oa","rush","address","bank","inv","tax","ar","planning","prio","itin","salestax","cogs","pf","web","am"],"renewsYrs":[]},"growth":{"key":"growth","name":"Growth","price":"$199","amount":199,"feeNote":"","detail":"Your LLC with tax ID, operating agreement, and bank setup.","ctaLabel":"Choose Growth","ctaUrl":"","badge":"Most popular","features":["LLC formation filing","Name availability check","Digital documents","Business logo","Compliance reminders","Tax ID (EIN)","Operating agreement template","Bank account setup guidance and document pack"],"featured":true,"groups":["home","us"],"country":"us","included":["formation","namecheck","docs","logo","reminders","ein","oa","bank"],"required":[],"missing":["ra","rush","address","inv","tax","ar","planning","prio","itin","salestax","cogs","pf","web","am"],"renewsYrs":[]},"premium":{"key":"premium","name":"Premium","price":"$399","amount":399,"feeNote":"","detail":"US address, rush filing, USD invoicing, and 24/7 support.","ctaLabel":"Choose Premium","ctaUrl":"","badge":"","features":["LLC formation filing","Name availability check","Digital documents","Business logo","Compliance reminders","Tax ID (EIN)","Operating agreement template","Rush filing","US business address, 5 scanned documents per year","Bank account setup guidance and document pack","Set up to invoice and get paid in USD","24/7 support"],"featured":false,"groups":["home","us"],"country":"us","included":["formation","namecheck","docs","logo","reminders","ein","oa","bank","rush","address","inv","prio","support"],"required":[],"missing":["ra","tax","ar","planning","itin","salestax","cogs","pf","web","am"],"renewsYrs":["address"]},"ecom":{"key":"ecom","name":"E-commerce Seller","price":"$399","amount":399,"feeNote":"","detail":"Your LLC filing plus Amazon and Shopify seller support in one order.","ctaLabel":"Choose E-commerce Seller","ctaUrl":"","badge":"","features":["LLC formation filing","Name availability check","Digital documents","Business logo","Compliance reminders","Amazon seller verification support","Amazon seller documentation guidance","Shopify and payment-platform readiness pack","1\u20138 page business website"],"featured":false,"groups":["us-ecommerce"],"country":"us","included":["formation","namecheck","docs","logo","reminders","amzverify","amzdocs","shopify","web"],"required":["ra"],"missing":["ein","oa","rush","address","bank","inv","tax","ar","planning","prio","itin","salestax","cogs","pf","am"],"renewsYrs":[]},"castarter":{"key":"castarter","name":"Canada Starter","price":"$199","amount":199,"feeNote":"+ gov fee, charged separately","detail":"Corporation setup \u2014 ON, BC, AB, SK or federal options","ctaLabel":"Choose Canada Starter","ctaUrl":"/start/","badge":"","features":["Filing coordination and document preparation","Registered office \u2014 year 1 included","Banking setup guidance","Annual compliance plans available"],"featured":false,"groups":["canada"],"country":"ca"},"cagrowth":{"key":"cagrowth","name":"Canada Growth","price":"$299","amount":299,"feeNote":"+ gov fee, charged separately","detail":"Incorporate provincially or federally.","ctaLabel":"Choose Canada Growth","ctaUrl":"/start/","badge":"Most popular","features":["Government fee charged separately at cost","Incorporation in a supported province (ON, BC, AB, SK) or federally","Certificate of Incorporation & Articles","NUANS name search (named companies)","Named or numbered company option","Digital document delivery","Filing status updates by email","Jurisdiction selection guidance","Next-step checklist after incorporation"],"featured":true,"groups":["canada"],"country":"ca"},"formation":{"key":"formation","name":"LLC formation filing","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"namecheck":{"key":"namecheck","name":"Name availability check","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"docs":{"key":"docs","name":"Digital documents","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"bundle":{"key":"bundle","name":"U.S. + Canada","price":"$399","amount":399,"feeNote":"USD \u00b7 one-time \u00b7 + Canada gov fee \u00b7 + U.S. state fees","detail":"Canada and U.S. company setup \u2014 one provider","ctaLabel":"Choose U.S. + Canada Bundle","ctaUrl":"","badge":"","features":["Registered agent (U.S.) + registered office (Canada) \u2014 year 1 included","All formation documents delivered","Banking guidance for both countries","One dedicated point of contact"],"featured":false,"groups":["home","bundle"],"country":""},"logo":{"key":"logo","name":"Business logo","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"reminders":{"key":"reminders","name":"Compliance reminders","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"amzverify":{"key":"amzverify","name":"Amazon seller verification support","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"amzdocs":{"key":"amzdocs","name":"Amazon seller documentation guidance","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"shopify":{"key":"shopify","name":"Shopify and payment-platform readiness pack","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"ra":{"key":"ra","name":"Registered agent","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"ein":{"key":"ein","name":"Tax ID (EIN)","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"oa":{"key":"oa","name":"Operating agreement template","price":"$49","amount":49,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"rush":{"key":"rush","name":"Rush filing","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"address":{"key":"address","name":"US business address and mail handling","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"bank":{"key":"bank","name":"Bank account setup guidance","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"inv":{"key":"inv","name":"Set up to invoice and get paid in USD","price":"$79","amount":79,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"support":{"key":"support","name":"24/7 support","price":"","amount":0,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"tax":{"key":"tax","name":"Annual US tax filing","price":"$499","amount":499,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"ar":{"key":"ar","name":"Annual report filing","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"planning":{"key":"planning","name":"Annual compliance planning session","price":"$149","amount":149,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"prio":{"key":"prio","name":"Priority email support","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"fg-basic":{"key":"fg-basic","name":"FilingGuard Basic","price":"$12","amount":12,"feeNote":"per month","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["filingguard"],"country":""},"itin":{"key":"itin","name":"Personal US tax number (ITIN)","price":"$399","amount":399,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"fg-pro":{"key":"fg-pro","name":"FilingGuard Pro","price":"$29","amount":29,"feeNote":"per month","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["filingguard"],"country":""},"fg-scale":{"key":"fg-scale","name":"FilingGuard Scale","price":"$99","amount":99,"feeNote":"per month","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["filingguard"],"country":""},"salestax":{"key":"salestax","name":"Sales-tax registration","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"cogs":{"key":"cogs","name":"Certificate of Good Standing","price":"$79","amount":79,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"pf":{"key":"pf","name":"Post-formation compliance guidance","price":"$99","amount":99,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"web":{"key":"web","name":"1\u20138 page business website","price":"$149","amount":149,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""},"am":{"key":"am","name":"Dedicated account manager","price":"$299","amount":299,"feeNote":"","detail":"","ctaLabel":"","ctaUrl":"","badge":"","features":[],"featured":false,"groups":["addon"],"country":""}},"prices":{"starter":"$29","growth":"$199","premium":"$399","ecom":"$399","castarter":"$199","cagrowth":"$299","formation":"","namecheck":"","docs":"","bundle":"$399","logo":"","reminders":"","amzverify":"","amzdocs":"","shopify":"","ra":"$99","ein":"$99","oa":"$49","rush":"$99","address":"$99","bank":"$99","inv":"$79","support":"","tax":"$499","ar":"$99","planning":"$149","prio":"$99","fg-basic":"$12","itin":"$399","fg-pro":"$29","fg-scale":"$99","salestax":"$99","cogs":"$79","pf":"$99","web":"$149","am":"$299"},"priceNum":{"starter":29,"growth":199,"premium":399,"ecom":399,"castarter":199,"cagrowth":299,"formation":0,"namecheck":0,"docs":0,"bundle":399,"logo":0,"reminders":0,"amzverify":0,"amzdocs":0,"shopify":0,"ra":99,"ein":99,"oa":49,"rush":99,"address":99,"bank":99,"inv":79,"support":0,"tax":499,"ar":99,"planning":149,"prio":99,"fg-basic":12,"itin":399,"fg-pro":29,"fg-scale":99,"salestax":99,"cogs":79,"pf":99,"web":149,"am":299},"addons":{"formation":{"n":"LLC formation filing","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"namecheck":{"n":"Name availability check","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"docs":{"n":"Digital documents","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"logo":{"n":"Business logo","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"reminders":{"n":"Compliance reminders","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"amzverify":{"n":"Amazon seller verification support","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"amzdocs":{"n":"Amazon seller documentation guidance","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"shopify":{"n":"Shopify and payment-platform readiness pack","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"ra":{"n":"Registered agent","price":99,"ecom":false,"yearly":true,"year1":99,"desc":"Every US LLC needs one. Add ours or use your own.","qty":false},"ein":{"n":"Tax ID (EIN)","price":99,"ecom":false,"yearly":false,"year1":99,"desc":"","qty":false},"oa":{"n":"Operating agreement template","price":49,"ecom":false,"yearly":false,"year1":49,"desc":"","qty":false},"rush":{"n":"Rush filing","price":99,"ecom":false,"yearly":false,"year1":99,"desc":"","qty":false},"address":{"n":"US business address and mail handling","price":99,"ecom":false,"yearly":true,"year1":99,"desc":"5 scans per year, extra scans $15 each.","qty":false},"bank":{"n":"Bank account setup guidance","price":99,"ecom":false,"yearly":false,"year1":99,"desc":"Bank-ready document pack. Approval is the bank's decision.","qty":false},"inv":{"n":"Set up to invoice and get paid in USD","price":79,"ecom":false,"yearly":false,"year1":79,"desc":"One-time setup.","qty":false},"support":{"n":"24/7 support","price":0,"ecom":false,"yearly":false,"year1":0,"desc":"","qty":false},"tax":{"n":"Annual US tax filing","price":499,"ecom":false,"yearly":true,"year1":499,"desc":"Form 5472 and pro forma 1120.","qty":false},"ar":{"n":"Annual report filing","price":99,"ecom":false,"yearly":true,"year1":0,"desc":"","qty":false},"planning":{"n":"Annual compliance planning session","price":149,"ecom":false,"yearly":true,"year1":149,"desc":"60-minute call plus written summary.","qty":false},"prio":{"n":"Priority email support","price":99,"ecom":false,"yearly":true,"year1":99,"desc":"12 months. Premium includes 24/7 support.","qty":false},"itin":{"n":"Personal US tax number (ITIN)","price":399,"ecom":false,"yearly":false,"year1":399,"desc":"Application prepared for you.","qty":false},"salestax":{"n":"Sales-tax registration","price":99,"ecom":false,"yearly":false,"year1":99,"desc":"Priced per state.","qty":true},"cogs":{"n":"Certificate of Good Standing","price":79,"ecom":false,"yearly":false,"year1":79,"desc":"","qty":false},"pf":{"n":"Post-formation compliance guidance","price":99,"ecom":false,"yearly":false,"year1":99,"desc":"What to file and when after formation.","qty":false},"web":{"n":"1\u20138 page business website","price":149,"ecom":false,"yearly":false,"year1":149,"desc":"With domain and business email for year 1.","qty":false},"am":{"n":"Dedicated account manager","price":299,"ecom":false,"yearly":true,"year1":299,"desc":"One named contact for 12 months.","qty":false}},"addonList":{"starter":["ra","ein","oa","rush","address","bank","inv","tax","ar","planning","prio","itin","salestax","cogs","pf","web","am"],"growth":["ra","rush","address","inv","tax","ar","planning","prio","itin","salestax","cogs","pf","web","am"],"premium":["ra","tax","ar","planning","itin","salestax","cogs","pf","web","am"],"ecom":["ein","oa","rush","address","bank","inv","tax","ar","planning","prio","itin","salestax","cogs","pf","am"]}},"cart":{"base":"https://corsspointinfo.test/","nonce":"84f34d6d52","url":"https://corsspointinfo.test/cart/","pricing":"https://corsspointinfo.test/pricing/","selected":"","state":""},"states":[{"slug":"alabama","name":"Alabama","enabled":true,"formation":165},{"slug":"alaska","name":"Alaska","enabled":true,"formation":250},{"slug":"arizona","name":"Arizona","enabled":true,"formation":50},{"slug":"arkansas","name":"Arkansas","enabled":true,"formation":50},{"slug":"california","name":"California","enabled":true,"formation":75},{"slug":"colorado","name":"Colorado","enabled":true,"formation":50},{"slug":"connecticut","name":"Connecticut","enabled":true,"formation":175},{"slug":"delaware","name":"Delaware","enabled":true,"formation":140},{"slug":"florida","name":"Florida","enabled":true,"formation":155},{"slug":"georgia","name":"Georgia","enabled":true,"formation":100},{"slug":"hawaii","name":"Hawaii","enabled":true,"formation":50},{"slug":"idaho","name":"Idaho","enabled":true,"formation":100},{"slug":"illinois","name":"Illinois","enabled":true,"formation":500},{"slug":"indiana","name":"Indiana","enabled":true,"formation":90},{"slug":"iowa","name":"Iowa","enabled":true,"formation":50},{"slug":"kansas","name":"Kansas","enabled":true,"formation":160},{"slug":"kentucky","name":"Kentucky","enabled":true,"formation":55},{"slug":"louisiana","name":"Louisiana","enabled":true,"formation":100},{"slug":"maine","name":"Maine","enabled":true,"formation":175},{"slug":"maryland","name":"Maryland","enabled":true,"formation":155},{"slug":"massachusetts","name":"Massachusetts","enabled":true,"formation":520},{"slug":"michigan","name":"Michigan","enabled":true,"formation":50},{"slug":"minnesota","name":"Minnesota","enabled":true,"formation":160},{"slug":"mississippi","name":"Mississippi","enabled":true,"formation":50},{"slug":"missouri","name":"Missouri","enabled":true,"formation":50},{"slug":"montana","name":"Montana","enabled":true,"formation":70},{"slug":"nebraska","name":"Nebraska","enabled":true,"formation":120},{"slug":"nevada","name":"Nevada","enabled":true,"formation":75},{"slug":"new_hampshire","name":"New Hampshire","enabled":true,"formation":100},{"slug":"new_jersey","name":"New Jersey","enabled":true,"formation":125},{"slug":"new_mexico","name":"New Mexico","enabled":true,"formation":50},{"slug":"new_york","name":"New York","enabled":true,"formation":210},{"slug":"north_carolina","name":"North Carolina","enabled":true,"formation":125},{"slug":"north_dakota","name":"North Dakota","enabled":true,"formation":135},{"slug":"ohio","name":"Ohio","enabled":true,"formation":125},{"slug":"oklahoma","name":"Oklahoma","enabled":true,"formation":104},{"slug":"oregon","name":"Oregon","enabled":true,"formation":100},{"slug":"pennsylvania","name":"Pennsylvania","enabled":true,"formation":125},{"slug":"rhode_island","name":"Rhode Island","enabled":true,"formation":150},{"slug":"south_carolina","name":"South Carolina","enabled":true,"formation":110},{"slug":"south_dakota","name":"South Dakota","enabled":true,"formation":150},{"slug":"tennessee","name":"Tennessee","enabled":true,"formation":325},{"slug":"texas","name":"Texas","enabled":true,"formation":310},{"slug":"utah","name":"Utah","enabled":true,"formation":72},{"slug":"vermont","name":"Vermont","enabled":true,"formation":125},{"slug":"virginia","name":"Virginia","enabled":true,"formation":104},{"slug":"washington","name":"Washington","enabled":true,"formation":200},{"slug":"dc","name":"Washington, D.C.","enabled":true,"formation":220},{"slug":"west_virginia","name":"West Virginia","enabled":true,"formation":132},{"slug":"wisconsin","name":"Wisconsin","enabled":true,"formation":130},{"slug":"wyoming","name":"Wyoming","enabled":true,"formation":103}],"profile":[],"answers":[],"uid":"0"};

/* ===== cpf-quiz-js ===== */
/**
 * CrossPoint - quiz.js
 * Homepage "Find Your Best Setup Path" quiz (3 steps).
 *
 * Every price shown here comes from cpfConfig.packages, which the theme builds
 * from the Packages CPT: the quiz can never quote a price /pricing/ does not.
 * Submissions go to POST /wp-json/crosspoint/v1/lead with source "home-quiz".
 */
var cpfConfig = window.cpfConfig || {};
var CPF_PKG = cpfConfig.packages || {};
var CPF_SITE = window.cpfSite || {};

/**
 * One package from the CPT by machine key.
 *
 * @param {string} key Package key, e.g. starter.
 * @return {Object} Package data, or an empty object.
 */
function cpfPackage( key ) {
  return ( CPF_PKG.byKey && CPF_PKG.byKey[ key ] ) || {};
}

/**
 * A WhatsApp link with a prefilled message, using the configured number.
 *
 * @param {string} text Message body.
 * @return {string} URL.
 */
function cpfWa( text ) {
  return ( CPF_SITE.waBase || 'https://wa.me/' ) + '?text=' + encodeURIComponent( text );
}
var heroQuizStep = 1;
var heroQuizTotal = 3;
var heroQuizData = { country: '', destination: '', business_goal: '', name: '', email: '', phone: '' }
;
function getHeroQuizFlow() {
    var flow = ['country', 'destination'];
    if (heroQuizData.destination === 'help_decide') flow.push('goal');
    flow.push('contact');
    return flow;
  }
function getHeroQuizStepId() {
    var flow = getHeroQuizFlow();
    return flow[heroQuizStep - 1] || flow[0];
  }
function focusHeroQuiz() {
    var anchor = document.getElementById('hero-quiz-anchor') || document.getElementById('hero-quiz');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var panel = anchor.querySelector ? anchor.querySelector('.hero-quiz-panel') || anchor : anchor;
      panel.style.transition = 'outline 0.2s ease';
      panel.style.outline = '3px solid var(--accent)';
      panel.style.outlineOffset = '3px';
      setTimeout(function () { panel.style.outline = ''; panel.style.outlineOffset = ''; }, 2200);
    }
    var menu = document.getElementById('mobileMenu');
    var burger = document.getElementById('burger');
    if (menu) menu.classList.remove('open');
    if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  }
function heroQuizPick(field, value, el) {
    heroQuizData[field] = value;
    if (field === 'destination' && value !== 'help_decide') {
      heroQuizData.business_goal = '';
      var goalStep = document.querySelector('.hero-quiz-step[data-step-id="goal"]');
      if (goalStep) {
        goalStep.querySelectorAll('.hero-quiz-option').forEach(function (o) {
          o.classList.remove('selected');
          o.setAttribute('aria-pressed', 'false');
          var radio = o.querySelector('input[type="radio"]');
          if (radio) radio.checked = false;
        });
      }
    }
    var step = el.closest('.hero-quiz-step');
    if (step) {
      /* aria-pressed says to a screen reader what .selected shows on screen. */
      step.querySelectorAll('.hero-quiz-option').forEach(function (o) { o.classList.remove('selected'); o.setAttribute('aria-pressed', 'false'); });
      el.classList.add('selected');
      el.setAttribute('aria-pressed', 'true');
      var radio = el.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
    updateHeroQuizNextState();
  }
function updateHeroQuizNextState() {
    var nextBtn = document.getElementById('hero-quiz-next');
    var backBtn = document.getElementById('hero-quiz-back');
    if (!nextBtn) return;
    var stepId = getHeroQuizStepId();
    if (backBtn) backBtn.classList.toggle('hidden', heroQuizStep === 1);
    var canContinue = false;
    if (stepId === 'country') canContinue = !!heroQuizData.country;
    else if (stepId === 'destination') canContinue = !!heroQuizData.destination;
    else if (stepId === 'goal') canContinue = !!heroQuizData.business_goal;
    else if (stepId === 'contact') {
      nextBtn.textContent = 'Get my path';
      nextBtn.disabled = false;
      return;
    }
    nextBtn.textContent = 'Continue';
    nextBtn.disabled = !canContinue;
  }
function heroQuizNext() {
    var stepId = getHeroQuizStepId();
    if (stepId === 'contact') { submitHeroQuiz(); return; }
    if (stepId === 'country' && !heroQuizData.country) return;
    if (stepId === 'destination' && !heroQuizData.destination) return;
    if (stepId === 'goal' && !heroQuizData.business_goal) return;
    if (heroQuizStep < getHeroQuizFlow().length) {
      heroQuizStep++;
      showHeroQuizStep();
    }
  }
function heroQuizBack() {
    if (heroQuizStep > 1) {
      heroQuizStep--;
      showHeroQuizStep();
    }
  }
function updateHeroQuizLayout() {
    var panel = document.getElementById('hero-quiz');
    var split = document.getElementById('hero-quiz-anchor');
    var started = heroQuizStep > 1;
    if (panel) panel.classList.toggle('quiz-started', started);
    if (split) split.classList.toggle('quiz-started', started);
    var reassure = document.getElementById('hero-quiz-reassure');
    if (reassure) reassure.style.display = started ? 'none' : 'flex';
  }
function showHeroQuizStep() {
    var stepId = getHeroQuizStepId();
    document.querySelectorAll('.hero-quiz-step').forEach(function (s) {
      s.classList.toggle('active', s.dataset.stepId === stepId);
    });
    heroQuizTotal = getHeroQuizFlow().length;
    var thanks = document.getElementById('hero-quiz-thanks');
    if (thanks) thanks.classList.remove('show');
    document.getElementById('hero-quiz-actions').style.display = 'flex';
    updateHeroQuizLayout();
    updateHeroQuizProgress();
    updateHeroQuizNextState();
    updateHeroDashboard();
  }
function updateHeroDashboard() {
    var widths = [[25,15,10],[50,35,25],[67,50,35],[85,70,55],[100,90,80]];
    var idx = Math.max(heroQuizStep - 1, 0);
    var w = widths[idx];
    var d1 = document.getElementById('hq-dash-1');
    var d2 = document.getElementById('hq-dash-2');
    var d3 = document.getElementById('hq-dash-3');
    if (d1) d1.style.width = w[0] + '%';
    if (d2) d2.style.width = w[1] + '%';
    if (d3) d3.style.width = w[2] + '%';
  }
function updateHeroQuizProgress() {
    var pct = Math.round((heroQuizStep / heroQuizTotal) * 100);
    var label = document.getElementById('hero-quiz-step-label');
    var pctEl = document.getElementById('hero-quiz-pct');
    var bar = document.getElementById('hero-quiz-bar');
    if (label) label.textContent = 'Step ' + heroQuizStep + ' of ' + heroQuizTotal;
    if (pctEl) pctEl.textContent = pct + '%';
    if (bar) bar.style.width = pct + '%';
  }
function destinationLabel(val) {
    if (val === 'usa') return 'U.S.';
    if (val === 'canada') return 'Canada';
    if (val === 'both') return 'Both U.S. and Canada';
    if (val === 'help_decide') return 'Help me decide';
    return val;
  }
function businessGoalLabel(val) {
    if (val === 'online_business') return 'Online business / freelancing';
    if (val === 'ecommerce') return 'E-commerce / Amazon / Shopify';
    if (val === 'consulting') return 'Consulting or agency';
    if (val === 'international_trading') return 'International trading';
    if (val === 'not_sure') return 'I am not sure yet';
    return val;
  }
/* Countries routed to a manual eligibility review — edit this list only. */
  var manualReviewCountries = ['Iran', 'Syria', 'North Korea', 'Cuba', 'Russia', 'Belarus'];
function getEffectiveDestination() {
    if (manualReviewCountries.indexOf(heroQuizData.country) !== -1) return 'review';
    if (heroQuizData.business_goal === 'ecommerce') return 'ecommerce';
    if (heroQuizData.destination !== 'help_decide') return heroQuizData.destination;
    if (heroQuizData.business_goal === 'international_trading') return 'both';
    if (heroQuizData.business_goal === 'not_sure') return 'advisor';
    return 'usa';
  }
var CALENDLY_URL = CPF_SITE.calendlyUrl || '';


  /**
   * The package recommended for a quiz outcome.
   *
   * Names, prices and detail lines come from the Packages CPT; only the routing
   * logic lives here.
   *
   * @param {string} dest Quiz destination.
   * @return {Object} Recommendation.
   */
  function getRecommendedPackage(dest) {
    if (dest === 'review') {
      return {
        name: 'Manual eligibility review',
        price: 'Advisor-led',
        detail: 'Service availability for your country needs a quick manual review. Message us on WhatsApp and we will confirm your options.',
        cta: 'Request Eligibility Review on WhatsApp',
        checkout: cpfWa('Hi CrossPoint, I completed the setup quiz and I need an eligibility review for my country.'),
        whatsapp: cpfWa('Hi CrossPoint, I completed the setup quiz and I need an eligibility review for my country.')
      };
    }
    if (dest === 'advisor') {
      return {
        name: 'Personalized setup review',
        price: 'Advisor-led',
        detail: 'We will recommend the right Canada or U.S. path for your goal.',
        checkout: CALENDLY_URL,
        whatsapp: cpfWa('Hi CrossPoint, I completed the setup quiz and I need help choosing the right package.')
      };
    }

    var map = { ecommerce: 'ecom', canada: 'castarter', both: 'bundle' };
    var key = map[dest] || 'starter';
    var pkg = cpfPackage(key);

    return {
      name: pkg.name || '',
      price: pkg.price || '',
      detail: [pkg.detail, pkg.feeNote].filter(Boolean).join(' \u00b7 '),
      checkout: pkg.ctaUrl || packageChooseUrl(key),
      whatsapp: cpfWa('Hi CrossPoint, I completed the setup quiz and I want help with ' + (pkg.name || 'my recommended package') + '.')
    };
  }
/* The "choose this package" link the package's own card on this page carries.
   Most packages set no CTA URL of their own, so "Start This Package" fell back
   to the wizard and the customer had to pick the same package again at the
   end. The card's link already holds the nonce and only exists when the
   package can be bought, so it is reused rather than rebuilt here. */
function packageChooseUrl(key) {
    var links = document.querySelectorAll('a[href*="cpf_action=choose"]');

    for (var i = 0; i < links.length; i++) {
      try {
        if (new URL(links[i].href).searchParams.get('plan') === key) {
          return links[i].href;
        }
      } catch (e) {}
    }

    return '';
  }
function updateQuizResultPackage() {
    var dest = getEffectiveDestination();
    var pkg = getRecommendedPackage(dest);
    var tagEl = document.getElementById('hero-quiz-result-tag');
    var nameEl = document.getElementById('hero-quiz-result-name');
    var priceEl = document.getElementById('hero-quiz-result-price');
    var detailEl = document.getElementById('hero-quiz-result-detail');
    var checkoutEl = document.getElementById('hero-quiz-checkout');
    if (tagEl) {
      if (dest === 'review') {
        tagEl.textContent = 'Eligibility review required';
      } else if (heroQuizData.destination === 'help_decide') {
        tagEl.textContent = 'Suggested for you';
      } else {
        tagEl.textContent = 'Recommended';
      }
    }
    if (nameEl) nameEl.textContent = pkg.name;
    if (priceEl) priceEl.textContent = pkg.price;
    if (detailEl) detailEl.textContent = pkg.detail;
    if (checkoutEl) {
      /* Only overwrite the href when there is somewhere to send people. A
         package with no CTA URL - the U.S. + Canada bundle has none, because it
         is arranged rather than bought on the page - used to set href to '',
         which points at the current page: the button looked live, and clicking
         it silently reloaded the homepage. Leaving the markup's own /start/ in
         place means a missing CTA degrades to the setup wizard instead of to
         nothing. */
      if (pkg.checkout) {
        checkoutEl.href = pkg.checkout;
      }
      checkoutEl.textContent = pkg.cta || (pkg.checkout === CALENDLY_URL ? 'Book a Free 15-Min Call' : 'Start This Package');
    }
    var whatsappEl = document.getElementById('hero-quiz-whatsapp');
    if (whatsappEl) {
      whatsappEl.href = pkg.whatsapp || cpfWa('Hi CrossPoint, I completed the setup quiz and I want help with my recommended package.');
      whatsappEl.style.display = dest === 'review' ? 'none' : 'inline-flex';
    }
    var bookCallEl = document.getElementById('hero-quiz-book-call');
    if (bookCallEl) {
      bookCallEl.style.display = dest === 'review' ? 'none' : 'inline-flex';
    }
  }
/* Show a problem under the field it belongs to rather than in a browser alert:
   an alert covers the form, cannot point at a box, and reads poorly on a phone.
   Each input owns its own message, so two problems can be shown at once. */
var HERO_QUIZ_FIELDS = ['hero-quiz-name', 'hero-quiz-phone', 'hero-quiz-email'];
function showHeroQuizError(message, fieldId) {
    var box = document.getElementById('hero-quiz-error-' + fieldId.replace('hero-quiz-', ''));
    var field = document.getElementById(fieldId);

    if (box) {
      box.textContent = message;
      box.hidden = false;
    }

    if (field) {
      field.setAttribute('aria-invalid', 'true');
      field.focus();
    }
  }
function showHeroQuizFormError(message) {
    var box = document.getElementById('hero-quiz-error');

    if (box) {
      box.textContent = message;
      box.hidden = false;
    }
  }
function clearHeroQuizError() {
    HERO_QUIZ_FIELDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.removeAttribute('aria-invalid');

      var box = document.getElementById('hero-quiz-error-' + id.replace('hero-quiz-', ''));
      if (box) { box.textContent = ''; box.hidden = true; }
    });

    var form = document.getElementById('hero-quiz-error');
    if (form) { form.textContent = ''; form.hidden = true; }
  }
/* Clearing on input means a corrected field stops looking wrong straight away,
   instead of staying red until the next attempt. */
HERO_QUIZ_FIELDS.forEach(function (id) {
  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== id) return;
    e.target.removeAttribute('aria-invalid');
    var box = document.getElementById('hero-quiz-error-' + id.replace('hero-quiz-', ''));
    if (box) { box.textContent = ''; box.hidden = true; }
  });
});
function submitHeroQuiz() {
    var name = (document.getElementById('hero-quiz-name').value || '').trim();
    var email = (document.getElementById('hero-quiz-email').value || '').trim();
    var phone = (document.getElementById('hero-quiz-phone').value || '').trim();

    clearHeroQuizError();

    if (!name) {
      showHeroQuizError('Please enter your name.', 'hero-quiz-name');
      return;
    }

    if (!phone) {
      showHeroQuizError('Please enter your WhatsApp number, including the country code.', 'hero-quiz-phone');
      return;
    }

    /* The lead endpoint requires an email address (build spec section 11.1), so
       the quiz asks for one too - on the static site it was optional and those
       submissions arrived with no way to reply by email. */
    if (!email) {
      showHeroQuizError('Please enter your email address so we can send your setup path.', 'hero-quiz-email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showHeroQuizError('That email address does not look right. Please check it.', 'hero-quiz-email');
      return;
    }

    /* Permission to make contact, the same box every other lead form carries.
       The endpoint refuses a home-quiz lead without it, so the message has to
       be here or the send fails with nothing on screen to explain why. */
    var consentBox = document.querySelector('.hero-quiz-step .cpf-consent-box');

    if (consentBox && !consentBox.checked) {
      /* The step-wide error line, not showHeroQuizError: that one addresses a
         named field through its own error box, and the tick box has neither. */
      showHeroQuizFormError('Please tick the box to say we may contact you about your enquiry.');
      consentBox.focus();
      return;
    }

    heroQuizData.name = name;
    heroQuizData.email = email;
    heroQuizData.phone = phone;

    var nextBtn = document.getElementById('hero-quiz-next');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Sending…';


    fetch(( cpfConfig.restBase || '/wp-json/crosspoint/v1/' ) + 'lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cpfConfig.nonce || '' },
      body: JSON.stringify({
        full_name: name,
        email: email,
        whatsapp: phone,
        residence_country: heroQuizData.country,
        destination: destinationLabel(heroQuizData.destination),
        business_goal: heroQuizData.business_goal ? businessGoalLabel(heroQuizData.business_goal) : '',
        package: getRecommendedPackage(getEffectiveDestination()).name,
        source: 'home-quiz',
        consent: consentBox && consentBox.checked ? 'yes' : '',
        source_url: location.href,
        website: (document.getElementById('hero-quiz-gotcha') || {}).value || '',
        ts: cpfConfig.ts || 0
      })
    }).then(function (res) {
      /* The body says whether the lead was taken, and why not when it was
         refused - too many requests, the consent box, an expired session. That
         reason is what the visitor sees, not a generic failure. */
      return res.json().then(function (d) { return { res: res, d: d }; }, function () { return { res: res, d: null }; });
    }).then(function (out) {
      var res = out.res, d = out.d;
      if (d && 'rest_cookie_invalid_nonce' === d.code) {
        throw new Error('Your session expired \u2014 please reload the page and try again.');
      }
      if (res.ok && d && d.ok) {
        /* Conversion deliberately NOT fired here. This request is intercepted by
           /tools/cpf-lead.js, which re-points it at lead.php and fires the conversion
           itself, gated on !duplicate. Firing again here double-counted every new lead
           and counted 1 for duplicates that should count 0.
           One conversion owner per form: the shim. Owner decision 2026-07-29. */
        showHeroQuizThankYou();
      } else {
        throw new Error((d && typeof d.message === 'string' && d.message) ? d.message : '');
      }
    }).catch(function (err) {
      /* A SyntaxError or network failure has nothing to say to a visitor. */
      var msg = (err && !(err instanceof SyntaxError) && !(err instanceof TypeError) && err.message) ? err.message : '';
      showHeroQuizFormError(msg || 'Something went wrong sending your answers. Please try again, or message us on WhatsApp.');
      nextBtn.disabled = false;
      nextBtn.textContent = 'Get my path';
    });
  }
/* Hand the answers to the /start/ wizard.
   The quiz asks where you live, which country you are forming in, and your
   contact details; the wizard then asked all of it again. Stashing the answers
   lets it open on the first question that has not been answered yet.

   sessionStorage, not the URL: this carries a name, an email and a phone
   number, and query strings end up in referrer headers, server logs and
   analytics. It is also per-tab and cleared when the tab closes, and the
   wizard removes the key as soon as it has read it. */
function storeQuizHandoff() {
    var toFormCountry = { canada: 'ca', usa: 'us', ecommerce: 'us', both: 'us' };
    /* Quiz goal -> wizard business key (BIZ in start.js). Online business and
       freelancing is the freelancer card; e-commerce is its own. */
    var toBusiness = {
      online_business: 'freelancer',
      ecommerce: 'ecommerce',
      consulting: 'freelancer',
      international_trading: 'trading',
      not_sure: 'other'
    };

    try {
      sessionStorage.setItem('cpf_quiz_handoff', JSON.stringify({
        formCountry: toFormCountry[heroQuizData.destination] || '',
        business: toBusiness[heroQuizData.business_goal] || '',
        country: heroQuizData.country || '',
        name: heroQuizData.name || '',
        email: heroQuizData.email || '',
        phone: heroQuizData.phone || ''
      }));
    } catch (e) {
      /* Private mode, or storage full. The wizard simply starts from step one,
         which is what it did before this existed. */
    }
  }
function showHeroQuizThankYou() {
    storeQuizHandoff();
    document.querySelectorAll('.hero-quiz-step').forEach(function (s) { s.classList.remove('active'); });
    document.getElementById('hero-quiz-actions').style.display = 'none';
    updateHeroQuizLayout();
    updateQuizResultPackage();
    document.getElementById('hero-quiz-thanks').classList.add('show');
    var hd = document.getElementById('hero-quiz-heading');
    if (hd) hd.textContent = 'Your Setup Path is Ready';
    var sh = document.getElementById('hero-quiz-subhead');
    if (sh) sh.style.display = 'none';
    var tk = document.getElementById('hero-quiz-headtick');
    if (tk) tk.classList.add('show');
    var bar = document.getElementById('hero-quiz-bar');
    if (bar) bar.style.width = '100%';
    var pctEl = document.getElementById('hero-quiz-pct');
    if (pctEl) pctEl.textContent = '100%';
    var label = document.getElementById('hero-quiz-step-label');
    if (label) label.textContent = 'Based on your answers';
  }
function resetHeroQuiz() {
    heroQuizStep = 1;
    heroQuizData = { country: '', destination: '', business_goal: '', name: '', email: '', phone: '' };
    document.getElementById('hero-quiz-country').value = '';
    document.getElementById('hero-quiz-name').value = '';
    document.getElementById('hero-quiz-email').value = '';
    document.getElementById('hero-quiz-phone').value = '';
    var gotcha = document.getElementById('hero-quiz-gotcha');
    if (gotcha) gotcha.value = '';
    document.querySelectorAll('.hero-quiz-option').forEach(function (o) {
      o.classList.remove('selected');
      o.setAttribute('aria-pressed', 'false');
      var radio = o.querySelector('input[type="radio"]');
      if (radio) radio.checked = false;
    });
    document.getElementById('hero-quiz-thanks').classList.remove('show');
    var hd = document.getElementById('hero-quiz-heading');
    if (hd) hd.textContent = 'Find Your Best Setup Path';
    var sh = document.getElementById('hero-quiz-subhead');
    if (sh) sh.style.display = '';
    var tk = document.getElementById('hero-quiz-headtick');
    if (tk) tk.classList.remove('show');
    showHeroQuizStep();
  }

var __hqc = document.getElementById('hero-quiz-country');
if (__hqc) __hqc.addEventListener('change', function () {
    heroQuizData.country = this.value;
    updateHeroQuizNextState();
  });
var _hc=document.getElementById('hero-quiz-country'), _fc=document.getElementById('f-country');
if(_hc&&_fc&&_fc.options.length<=1){_fc.innerHTML=_hc.innerHTML;}

updateHeroQuizLayout();
updateHeroQuizNextState();
updateHeroDashboard();


/* ---------- Mega-menu promo link opens the quiz ---------- */
document.addEventListener( 'click', function ( event ) {
  var link = event.target && event.target.closest ? event.target.closest( 'a[href*="#hero-quiz-anchor"]' ) : null;

  if ( link ) {
    event.preventDefault();
    focusHeroQuiz();
  }
} );

/* ===== cpf-chat-js ===== */
/**
 * CrossPoint - chat.js
 * CrossPoint Chat widget. Rendered by template-parts/chat-widget.php and
 * enabled from CrossPoint Settings (Tracking tab).
 */
var cpChatLastFocus = null;
function scrollCpChatToBottom() {
    var box = document.getElementById('cpChatMessages');
    if (box) box.scrollTop = box.scrollHeight;
  }
function appendCpChatMsg(text, type) {
    var box = document.getElementById('cpChatMessages');
    if (!box) return;
    var msg = document.createElement('div');
    msg.className = 'cp-chat-msg ' + (type || 'bot');
    msg.textContent = text;
    box.appendChild(msg);
    scrollCpChatToBottom();
  }
function getCpChatReply(text) {
    var q = text.toLowerCase();
    if (/\b(canada|canadian|incorporat|federal|ontario|bc)\b/.test(q)) {
      return 'We help non-residents form Canadian corporations remotely, including federal and provincial options. Service fees start from USD $199, plus the government filing fee, which is charged separately at cost. For a setup path based on your country and business type, connect with a CrossPoint advisor below.';
    }
    if (/\b(llc|c-corp|c corp|corporation|delaware|wyoming|united states|u\.s\.|usa|america)\b/.test(q)) {
      return 'We support U.S. LLC and corporation formation for non-residents in any state. Packages start from USD $29 (Starter), $199 (Growth) and $399 (Premium), plus the state filing fee at cost. Selling on Amazon or Shopify? The E-commerce Seller package is USD $256. If you need both Canada and the U.S., our U.S. + Canada bundle is USD $419, saving $79 versus separate setups. For personal guidance, a CrossPoint advisor can walk you through the best option.';
    }
    if (/\b(bank|banking|account|stripe|payment)\b/.test(q)) {
      return 'We provide business banking documentation guidance and help prepare the documents banks typically request. Account approval is decided by each bank on its own criteria. For a review of your situation, connect with a CrossPoint advisor below.';
    }
    if (/\b(price|cost|fee|how much|pricing)\b/.test(q)) {
      return 'Canada incorporation is USD $199 (Canada Starter) or $299 (Canada Growth) plus the government filing fee, U.S. formation starts from USD $29 plus the state fee at cost, and our U.S. + Canada bundle is USD $399 (saves $99 vs separate setups). See the Pricing section on this page for details, or book a free 15-minute call for a personalized quote.';
    }
    if (/\b(resident|non-resident|non resident|live|country|citizen)\b/.test(q)) {
      return 'You do not need Canadian or U.S. residence for many eligible setup paths. Eligibility depends on your country of residence and business type. Share your details with a CrossPoint advisor and we will confirm the right path for you.';
    }
    if (/\b(human|advisor|person|call|speak|talk|whatsapp)\b/.test(q)) {
      return 'Happy to connect you with a CrossPoint advisor. Use WhatsApp Advisor or Book a Free 15-Min Call below — whichever is easiest for you.';
    }
    return 'Thanks for your question. I can help with general Canada and U.S. company setup topics here. For personal guidance on your specific situation, connect with a CrossPoint advisor using the links below.';
  }
function trapCpChatFocus(event) {
    var chat = document.getElementById('cpChat');
    if (!chat || !chat.classList.contains('open') || event.key !== 'Tab') return;
    var focusable = chat.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
function openCpChat() {
    var chat = document.getElementById('cpChat');
    var input = document.getElementById('cpChatInput');
    if (!chat) return;
    cpChatLastFocus = document.activeElement;
    chat.classList.add('open');
    chat.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', trapCpChatFocus);
    document.body.style.overflow = 'hidden';
    var menuEl = document.getElementById('mobileMenu');
    var burgerEl = document.getElementById('burger');
    if (menuEl) menuEl.classList.remove('open');
    if (burgerEl) {
      burgerEl.classList.remove('open');
      burgerEl.setAttribute('aria-expanded', 'false');
    }
    setTimeout(function () { if (input) input.focus(); }, 120);
  }
function closeCpChat() {
    var chat = document.getElementById('cpChat');
    if (!chat) return;
    chat.classList.remove('open');
    chat.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', trapCpChatFocus);
    document.body.style.overflow = '';
    if (cpChatLastFocus && typeof cpChatLastFocus.focus === 'function') {
      cpChatLastFocus.focus();
    }
    cpChatLastFocus = null;
  }
function sendCpChat(event) {
    if (event) event.preventDefault();
    var input = document.getElementById('cpChatInput');
    if (!input) return false;
    var text = input.value.trim();
    if (!text) return false;
    appendCpChatMsg(text, 'user');
    input.value = '';
    input.disabled = true;
    setTimeout(function () {
      appendCpChatMsg(getCpChatReply(text), 'bot');
      input.disabled = false;
      input.focus();
    }, 450);
    return false;
  }
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var chat = document.getElementById('cpChat');
      if (chat && chat.classList.contains('open')) closeCpChat();
    }
  });


/* ---------- Bindings ----------
   The static markup used inline onclick and onsubmit attributes; the theme
   binds the same behaviour here instead. */
( function () {
  'use strict';

  var chat = document.getElementById( 'cpChat' );

  if ( ! chat ) {
    return;
  }

  chat.addEventListener( 'click', function ( event ) {
    if ( event.target === chat ) {
      closeCpChat();
    }
  } );

  var close = chat.querySelector( '.cp-chat-close' );

  if ( close ) {
    close.addEventListener( 'click', closeCpChat );
  }

  var form = document.getElementById( 'cpChatForm' );

  if ( form ) {
    form.addEventListener( 'submit', sendCpChat );
  }

  document.addEventListener( 'click', function ( event ) {
    var trigger = event.target && event.target.closest ? event.target.closest( '.cpf-open-chat' ) : null;

    if ( trigger ) {
      event.preventDefault();
      openCpChat();
    }
  } );
}() );

/* ===== cpf-fontbar-js ===== */
( function () {
	var families = {
		inter: "'Inter', system-ui, sans-serif",
		poppins: "'Poppins', system-ui, sans-serif",
		montserrat: "'Montserrat', system-ui, sans-serif",
		roboto: "'Roboto', system-ui, sans-serif"
	};
	var buttons = document.querySelectorAll( '.cpf-fontbar button' );
	function apply( key ) {
		var root = document.documentElement;
		if ( families[ key ] ) {
			root.style.setProperty( '--disp', families[ key ] );
			root.style.setProperty( '--ui', families[ key ] );
		} else {
			key = 'default';
			root.style.removeProperty( '--disp' );
			root.style.removeProperty( '--ui' );
		}
		buttons.forEach( function ( b ) {
			b.setAttribute( 'aria-pressed', b.getAttribute( 'data-font' ) === key ? 'true' : 'false' );
		} );
		try { localStorage.setItem( 'cpfFontPreview', key ); } catch ( e ) {}
	}
	buttons.forEach( function ( b ) {
		b.addEventListener( 'click', function () { apply( b.getAttribute( 'data-font' ) ); } );
	} );
	var saved = 'default';
	try { saved = localStorage.getItem( 'cpfFontPreview' ) || 'default'; } catch ( e ) {}
	apply( saved );
}() );
