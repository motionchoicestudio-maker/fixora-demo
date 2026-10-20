/**
 * Fixora front-end: the Webflow IX3 interactions of the original template, rebuilt on GSAP + ScrollTrigger,
 * plus the mobile menu. Every tween plays once; prefers-reduced-motion skips straight to the end state.
 */
( function () {
	'use strict';

	var $ = function ( sel, root ) { return ( root || document ).querySelector( sel ); };
	var $$ = function ( sel, root ) { return Array.prototype.slice.call( ( root || document ).querySelectorAll( sel ) ); };

	/* Mobile menu */
	$$( '.fx-mobile-nav' ).forEach( function ( nav ) {
		var btn = $( '.fx-menu-button', nav );
		if ( ! btn ) {
			return;
		}
		var set = function ( open ) {
			nav.classList.toggle( 'is-open', open );
			btn.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		};
		btn.addEventListener( 'click', function () { set( ! nav.classList.contains( 'is-open' ) ); } );
		$$( 'a', nav ).forEach( function ( a ) { a.addEventListener( 'click', function () { set( false ); } ); } );
		document.addEventListener( 'keydown', function ( e ) { if ( 'Escape' === e.key ) { set( false ); } } );
	} );

	/* Hero heading: <br>-separated lines become blocks so they can rise one after another. */
	$$( '.fx-heading-hero' ).forEach( function ( h ) {
		if ( h.querySelector( '.fx-heading-hero-line' ) ) {
			return;
		}
		h.innerHTML = h.innerHTML.split( /<br\s*\/?>/i ).map( function ( l ) {
			return '<span class="fx-heading-hero-line">' + l + '</span>';
		} ).join( '' );
	} );

	var gsap = window.gsap;
	var reduce = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	if ( ! gsap || reduce || ! window.ScrollTrigger ) {
		return;
	}
	gsap.registerPlugin( window.ScrollTrigger );

	var OUT = 'power3.out';
	var POP = 'back.out(1.7)';

	// Plays `build(tl)` once when `trigger` reaches `start`.
	var onScroll = function ( trigger, start, build ) {
		if ( ! trigger ) {
			return;
		}
		var tl = gsap.timeline( { paused: true } );
		build( tl );
		window.ScrollTrigger.create( { trigger: trigger, start: start || 'top 85%', once: true, onEnter: function () { tl.play(); } } );
	};
	var fadeUp = function ( els, y, extra ) {
		return function ( tl ) {
			tl.from( els, Object.assign( { autoAlpha: 0, y: y || 24, duration: 0.7, ease: OUT }, extra || {} ) );
		};
	};

	/* Hero, on load */
	var hero = $( '.fx-section-hero' );
	if ( hero ) {
		gsap.timeline()
			.from( $( '.fx-hero-technician', hero ), { autoAlpha: 0, scale: 1.04, duration: 0.8, ease: OUT } )
			.from( $$( '.fx-heading-hero-line', hero ), { autoAlpha: 0, y: 30, duration: 0.8, stagger: 0.15, ease: OUT }, 0.1 )
			.from( $$( '.fx-hero-chips, .fx-hero-trust, .fx-hero-buttons', hero ), { autoAlpha: 0, y: 20, duration: 0.7, stagger: 0.1, ease: OUT }, 0.45 );
	}

	/* Section headings and simple blocks */
	$$( '.fx-section-heading, .fx-promise-heading, .fx-reviews-heading, .fx-stats-row, .fx-no-match-banner, .fx-faq-footer' ).forEach( function ( el ) {
		onScroll( el, 'top 85%', fadeUp( el ) );
	} );
	$$( '.fx-booking-card' ).forEach( function ( el ) {
		onScroll( el, 'top 85%', fadeUp( el, 40, { scale: 0.97 } ) );
	} );
	$$( '.fx-faq-list' ).forEach( function ( el ) {
		onScroll( el, 'top 85%', fadeUp( $$( '.fx-faq-item', el ), 20, { duration: 0.6, stagger: 0.08 } ) );
	} );
	$$( '.fx-utility-content > *:not(.fx-section-heading):not(.fx-jobs-query)' ).forEach( function ( el ) {
		onScroll( el, 'top 90%', fadeUp( el ) );
	} );

	/* Showcase: photo settles, badges pop, then drift with scroll */
	var show = $( '.fx-section-showcase' );
	if ( show ) {
		var badges = $$( '.fx-floating-badge', show );
		onScroll( $( '.fx-showcase-photo-wrapper', show ), 'top 85%', function ( tl ) {
			tl.from( $( '.fx-showcase-photo-frame', show ), { autoAlpha: 0, scale: 0.96, duration: 0.8, ease: OUT } )
				.from( badges, { autoAlpha: 0, scale: 0.7, duration: 0.6, stagger: 0.15, ease: POP }, 0.35 );
		} );
		if ( badges.length === 2 ) {
			var drift = { trigger: show, start: 'top bottom', end: 'bottom top', scrub: true };
			gsap.fromTo( badges[ 0 ], { y: 30 }, { y: -30, ease: 'none', scrollTrigger: drift } );
			gsap.fromTo( badges[ 1 ], { y: -30 }, { y: 30, ease: 'none', scrollTrigger: Object.assign( {}, drift ) } );
		}
	}

	/* Services grid */
	$$( '.fx-services-grid' ).forEach( function ( grid ) {
		onScroll( grid, 'top 85%', fadeUp( $$( '.fx-service-card', grid ), 32, { stagger: 0.08 } ) );
	} );

	/* Steps rail: line grows, dot pops, card slides in from its side */
	$$( '.fx-step-row' ).forEach( function ( row ) {
		var card = $( '.fx-step-card', row );
		var fromLeft = card && card.parentElement.classList.contains( 'fx-step-slot-end' );
		onScroll( row, 'top 75%', function ( tl ) {
			tl.from( $( '.fx-step-line', row ), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.6, ease: OUT } )
				.from( $( '.fx-step-dot', row ), { autoAlpha: 0, scale: 0.4, duration: 0.45, ease: POP }, 0.25 )
				.from( card, { autoAlpha: 0, x: fromLeft ? -38 : 38, duration: 0.6, ease: OUT }, 0.4 );
		} );
	} );

	/* Popular jobs: columns slide in, cards rise */
	$$( '.fx-popular-layout' ).forEach( function ( layout ) {
		onScroll( layout, 'top 85%', function ( tl ) {
			tl.from( $( '.fx-popular-photo-column', layout ), { autoAlpha: 0, xPercent: -8, duration: 0.8, ease: OUT } )
				.from( $( '.fx-popular-list-column', layout ), { autoAlpha: 0, xPercent: 8, duration: 0.8, ease: OUT }, 0.1 )
				.from( $$( '.fx-job-card', layout ), { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.06, ease: OUT }, 0.3 );
		} );
	} );

	/* Promise list: cards rise into place one after another, then each check turns green */
	$$( '.fx-promise-stack' ).forEach( function ( stack ) {
		var cards = $$( '.fx-promise-card', stack );
		var checks = $$( '.fx-promise-check', stack );
		onScroll( stack, 'top 85%', function ( tl ) {
			tl.from( cards, { autoAlpha: 0, y: 40, duration: 0.7, stagger: 0.12, ease: OUT } )
				.to( checks, { backgroundColor: 'rgba(18,183,106,0.16)', duration: 0.35, stagger: 0.12, ease: 'power2.out' }, 0.35 )
				.fromTo( checks, { scale: 0.85 }, { scale: 1, duration: 0.35, stagger: 0.12, ease: POP }, 0.35 );
		} );
	} );

	/* Reviews lanes drift in opposite directions */
	$$( '.fx-section-reviews' ).forEach( function ( sec ) {
		var tracks = $$( '.fx-reviews-track', sec );
		var st = { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true };
		if ( tracks[ 0 ] ) {
			gsap.fromTo( tracks[ 0 ], { xPercent: 4 }, { xPercent: -4, ease: 'none', scrollTrigger: st } );
		}
		if ( tracks[ 1 ] ) {
			gsap.fromTo( tracks[ 1 ], { xPercent: -4 }, { xPercent: 4, ease: 'none', scrollTrigger: Object.assign( {}, st ) } );
		}
	} );

	/* Before and after cards alternate sides */
	$$( '.fx-result-card' ).forEach( function ( card, i ) {
		onScroll( card, 'top 85%', function ( tl ) {
			tl.from( card, { autoAlpha: 0, xPercent: i % 2 ? 14 : -14, duration: 0.8, ease: OUT } );
		} );
	} );

	/* Footer: columns, then the wordmark rises */
	$$( '.fx-footer-content' ).forEach( function ( fc ) {
		onScroll( fc, 'top 85%', function ( tl ) {
			tl.from( $$( '.fx-footer-columns, .fx-footer-bottom', fc ), { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.12, ease: OUT } )
				.from( $( '.fx-footer-wordmark', fc ), { yPercent: 35, duration: 0.8, ease: OUT }, 0.25 );
		} );
	} );

	/* 404 */
	var nf = $( '.fx-not-found-content' );
	if ( nf ) {
		gsap.from( nf.children, { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.08, ease: OUT } );
	}

	window.addEventListener( 'load', function () { window.ScrollTrigger.refresh(); } );
}() );
