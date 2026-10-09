/**
 * Rupinder Kalsi — Financial Advisor
 * Modern Interactivity, Dynamic Calculators, Clarity Quiz & Micro-Animations
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Utility selector
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // ==========================================================================
  // 1. SCROLL PROGRESS, HEADER SCROLL STATE & ACTIVE NAV SPY
  // ==========================================================================
  const scrollProgress = $('#scroll-progress');
  const header = $('#header');
  const backToTopBtn = $('#back-to-top');
  const navLinks = $$('.desktop-nav a');
  const sections = $$('main > section[id]');

  function handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Progress bar (GPU-accelerated scaleX transform)
    if (docHeight > 0 && scrollProgress) {
      const progressRatio = Math.min(1, Math.max(0, scrollY / docHeight));
      scrollProgress.style.transform = `scaleX(${progressRatio})`;
    }

    // Header styling on scroll
    if (header) {
      header.classList.toggle('scrolled', scrollY > 40);
    }

    // Floating back-to-top visibility
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollY > 400);
    }

    // Active nav link spy
    let currentId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 2. MOBILE NAVIGATION MENU
  // ==========================================================================
  const menuBtn = $('.menu-button');
  const mobileNav = $('#mobile-nav');

  function closeMobileMenu() {
    if (mobileNav && menuBtn) {
      mobileNav.hidden = true;
      mobileNav.classList.remove('is-open');
      mobileNav.style.display = 'none';
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open navigation menu');
    }
  }

  function openMobileMenu() {
    if (mobileNav && menuBtn) {
      updateMobileNavPosition();
      mobileNav.hidden = false;
      mobileNav.classList.add('is-open');
      mobileNav.style.display = 'flex';
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close navigation menu');
    }
  }

  function updateMobileNavPosition() {
    if (mobileNav && header) {
      mobileNav.style.top = `${header.offsetHeight}px`;
      mobileNav.style.maxHeight = `calc(100dvh - ${header.offsetHeight}px)`;
    }
  }

  // Ensure menu starts strictly closed on page load
  closeMobileMenu();

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
    } else {
      updateMobileNavPosition();
    }
  }, { passive: true });

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    $$('a, button', mobileNav).forEach(el => {
      el.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (mobileNav && mobileNav.classList.contains('is-open')) {
        if (!mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !mobileNav.hidden) {
        closeMobileMenu();
      }
    });
  }

  // ==========================================================================
  // 3. INTERSECTION OBSERVER FOR SCROLL REVEALS & NUMBER COUNTERS
  // ==========================================================================
  const revealElements = $$('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // Animate counter if element or children have data-counter
          const counters = $$('[data-counter]', entry.target);
          counters.forEach(counter => {
            const target = parseInt(counter.dataset.counter, 10);
            if (!counter.dataset.animated) {
              counter.dataset.animated = 'true';
              animateCounter(counter, target);
            }
          });

          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('in-view'));
  }

  function animateCounter(element, target) {
    let start = 0;
    const duration = 1200;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = target / steps;
    
    const suffix = element.querySelector('span') ? element.querySelector('span').textContent : '';

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.innerHTML = `${target}<span>${suffix}</span>`;
        clearInterval(timer);
      } else {
        element.innerHTML = `${Math.floor(start)}<span>${suffix}</span>`;
      }
    }, stepTime);
  }

  // ==========================================================================
  // 4. DIALOG / MODAL MANAGERS
  // ==========================================================================
  const dialogs = $$('dialog');
  const bookingDialog = $('#booking-dialog');
  const serviceDialog = $('#service-dialog');
  const articleDialog = $('#article-dialog');
  const privacyDialog = $('#privacy-dialog');

  let lastFocusedElement = null;

  function openDialog(dialog) {
    if (!dialog) return;
    lastFocusedElement = document.activeElement;
    closeMobileMenu();
    try {
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        dialog.setAttribute('open', '');
      }
      document.body.classList.add('modal-open');
    } catch (err) {
      if (!dialog.open) {
        dialog.setAttribute('open', '');
      }
      document.body.classList.add('modal-open');
    }
  }

  dialogs.forEach(dialog => {
    const closeBtn = $('.close-dialog', dialog);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }

    dialog.addEventListener('close', () => {
      const openRemaining = $$('dialog[open]');
      if (openRemaining.length === 0) {
        document.body.classList.remove('modal-open');
      }
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    });

    // Close on backdrop click
    dialog.addEventListener('click', e => {
      if (e.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        if (!isInDialog) dialog.close();
      }
    });
  });

  // ==========================================================================
  // 5. CONSULTATION BOOKING FLOW & MEETING FORMAT PICKER
  // ==========================================================================
  const bookingForm = $('#booking-form');
  const bookingContent = $('#booking-content');
  const bookingSuccess = $('#booking-success');
  const bookingTopicSelect = $('#booking-topic');
  const meetingTypeInput = $('#meetingTypeInput');
  const meetingTypeBtns = $$('.meeting-type-btn');

  function openBookingModal(topic = null, messagePrefill = '') {
    if (bookingForm) bookingForm.reset();
    if (bookingContent) bookingContent.hidden = false;
    if (bookingSuccess) bookingSuccess.hidden = true;
    
    if (topic && bookingTopicSelect) {
      if (bookingTopicSelect.tagName === 'SELECT' && bookingTopicSelect.options) {
        let found = false;
        Array.from(bookingTopicSelect.options).forEach(opt => {
          if (opt.text.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(opt.text.toLowerCase())) {
            bookingTopicSelect.value = opt.value;
            found = true;
          }
        });
        if (!found) bookingTopicSelect.selectedIndex = 0;
      } else {
        bookingTopicSelect.value = topic;
      }
    }

    if (messagePrefill && $('#booking-message')) {
      $('#booking-message').value = messagePrefill;
    }

    openDialog(bookingDialog);
  }

  // Bind all [data-book] triggers to open cal.com
  $$('[data-book]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.tagName.toLowerCase() !== 'a') {
        e.preventDefault();
        window.open('https://cal.com/rupinderkalsi', '_blank', 'noopener,noreferrer');
      }
    });
  });

  // Meeting format buttons
  meetingTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      meetingTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (meetingTypeInput) {
        meetingTypeInput.value = btn.dataset.type;
      }
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(bookingForm);
      const name = data.get('name') || 'Friend';
      const phone = data.get('phone') || '';
      const email = data.get('email') || '';
      const meetingType = data.get('meetingType') || 'Phone Call';

      const successMsg = $('#success-message');
      if (successMsg) {
        successMsg.innerHTML = `
          Thank you, <strong>${escapeHtml(name)}</strong>! Your consultation request has been received.<br><br>
          Rupinder will connect with you via <strong>${escapeHtml(meetingType)}</strong> at <strong>${escapeHtml(phone)}</strong> (and send a confirmation to <strong>${escapeHtml(email)}</strong>) within 24 business hours.
        `;
      }

      if (bookingContent) bookingContent.hidden = true;
      if (bookingSuccess) bookingSuccess.hidden = false;
      const closeSuccessBtn = $('.close-success', bookingSuccess);
      if (closeSuccessBtn) closeSuccessBtn.focus();
    });
  }

  const closeSuccessBtn = $('.close-success');
  if (closeSuccessBtn && bookingDialog) {
    closeSuccessBtn.addEventListener('click', () => bookingDialog.close());
  }

  // ==========================================================================
  // 6. EXPANDED SERVICES DATA & INTERACTIVE MODAL
  // ==========================================================================
  const serviceDetails = {
    family: {
      title: 'Family & Life Protection',
      description: 'Comprehensive financial safeguards designed to give the people who rely on you total resilience against life’s unpredictable events.',
      points: [
        'Determine appropriate term life, disability, and critical illness coverage amounts.',
        'Create a liquid 3–6 month emergency reserve structure to absorb surprises without stress.',
        'Coordinate wills, healthcare directives, and guardian provisions with legal specialists.',
        'Review debt-shielding strategies to ensure your family home and assets are protected.'
      ]
    },
    wealth: {
      title: 'Saving & Wealth Growth',
      description: 'Disciplined compounding strategies that bridge your everyday cash flow habits to long-term financial independence.',
      points: [
        'Establish automated "pay-yourself-first" investment schedules.',
        'Build a diversified, low-cost asset allocation tailored to your specific risk tolerance.',
        'Optimize asset location across taxable and registered/tax-advantaged accounts.',
        'Avoid common emotional pitfalls during market volatility through disciplined rebalancing.'
      ]
    },
    retirement: {
      title: 'Retirement & Beyond',
      description: 'Transforming decades of accumulation into a predictable, stress-free monthly income stream that lasts throughout your lifetime.',
      points: [
        'Model sustainable retirement withdrawal rates tailored to your desired lifestyle.',
        'Design a 2–3 year conservative cash buffer to prevent forced selling during market downturns.',
        'Determine optimal government pension claiming ages (CPP/OAS or Social Security).',
        'Incorporate healthcare, travel, and evolving lifestyle aspirations into cash flow models.'
      ]
    },
    education: {
      title: 'Children & Education Milestones',
      description: 'Giving your children and grandchildren a resilient foundation through structured education funds and first-home savings.',
      points: [
        'Maximize government education grants (such as CESG in Canada) through structured contributions.',
        'Align investment time horizon as high school graduation approaches to protect tuition capital.',
        'Explore tax-advantaged First Home Savings Accounts (FHSA) and family gifting structures.',
        'Foster healthy financial literacy and gratitude in children and young adults.'
      ]
    },
    tax: {
      title: 'Tax-Aware Cash Flow Strategy',
      description: 'Maximizing what you keep by coordinating accounts, corporate structures, and charitable donations with forward-looking tax efficiency.',
      points: [
        'Structure business distributions and corporate retained earnings efficiently.',
        'Minimize lifetime tax liabilities through strategic multi-year withdrawal timing.',
        'Incorporate tax-loss harvesting and dividend tax credit strategies into portfolio design.',
        'Collaborate seamlessly with your CPA or tax professional to ensure total alignment.'
      ]
    },
    legacy: {
      title: 'Legacy & Family Values',
      description: 'Preserving family harmony, passing enduring principles, and transferring wealth smoothly to the next generation and charitable causes.',
      points: [
        'Facilitate open, caring family discussions to establish transparency around estate wishes.',
        'Structure beneficiary designations and trusts to bypass costly probate and unnecessary delay.',
        'Implement tax-efficient philanthropic strategies through donor-advised funds and charitable gifts.',
        'Ensure non-financial family values and personal stories are thoughtfully documented.'
      ]
    }
  };

  let activeServiceKey = 'family';
  $$('[data-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.service;
      const data = serviceDetails[key];
      if (!data) return;

      activeServiceKey = key;
      $('#service-title').textContent = data.title;
      $('#service-description').textContent = data.description;
      
      const list = $('#service-points');
      list.innerHTML = '';
      data.points.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        list.appendChild(li);
      });

      openDialog(serviceDialog);
    });
  });

  const serviceBookBtn = $('#service-book');
  if (serviceBookBtn && serviceDialog) {
    serviceBookBtn.addEventListener('click', (e) => {
      serviceDialog.close();
      window.open('https://cal.com/rupinderkalsi', '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // 7. LIFE STAGES & MILESTONES INTERACTIVE HUB
  // ==========================================================================
  const stageTabs = $$('.stage-tab-btn');
  const stagePanels = $$('.stage-panel');

  stageTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetStage = tab.dataset.stage;
      
      // Update tab active states
      stageTabs.forEach(t => {
        const isCurrent = t === tab;
        t.classList.toggle('active', isCurrent);
        t.setAttribute('aria-selected', String(isCurrent));
      });

      // Show matching panel
      stagePanels.forEach(panel => {
        const isTarget = panel.id === `stage-${targetStage}`;
        panel.classList.toggle('active', isTarget);
      });

      // Smooth horizontal center scroll on mobile
      tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  // ==========================================================================
  // 8. 2-MINUTE INTERACTIVE CLARITY CHECK (QUIZ ENGINE)
  // ==========================================================================
  const quizSteps = [$('#quiz-step-1'), $('#quiz-step-2'), $('#quiz-step-3')];
  const quizResultView = $('#quiz-result-view');
  const quizNextBtns = $$('.quiz-next-btn');
  const quizPrevBtns = $$('.quiz-prev-btn');
  const quizFinishBtn = $('.quiz-finish-btn');
  const quizResetBtn = $('.quiz-reset-btn');
  const quizApplyBtn = $('#quiz-apply-btn');

  const quizState = {
    focus: 'Protecting my family & children’s security',
    timeline: 'Near-term: Next 1 to 3 years',
    feeling: 'Calm peace of mind & relief from anxiety'
  };

  // Option selection
  $$('.quiz-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepContainer = btn.closest('.quiz-step');
      if (!stepContainer) return;

      $$('.quiz-option-btn', stepContainer).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const stepId = stepContainer.id;
      if (stepId === 'quiz-step-1') quizState.focus = btn.dataset.value || btn.innerText.trim();
      if (stepId === 'quiz-step-2') quizState.timeline = btn.dataset.value || btn.innerText.trim();
      if (stepId === 'quiz-step-3') quizState.feeling = btn.dataset.value || btn.innerText.trim();
    });
  });

  quizNextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStepIndex = parseInt(btn.dataset.next, 10) - 1;
      quizSteps.forEach((s, idx) => {
        if (s) s.style.display = idx === nextStepIndex ? 'block' : 'none';
      });
      const quizCard = $('.quiz-card');
      if (quizCard && window.innerWidth <= 768) {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  quizPrevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStepIndex = parseInt(btn.dataset.prev, 10) - 1;
      quizSteps.forEach((s, idx) => {
        if (s) s.style.display = idx === prevStepIndex ? 'block' : 'none';
      });
      const quizCard = $('.quiz-card');
      if (quizCard && window.innerWidth <= 768) {
        quizCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  if (quizFinishBtn) {
    quizFinishBtn.addEventListener('click', () => {
      quizSteps.forEach(s => { if (s) s.style.display = 'none'; });
      if (quizResultView) {
        quizResultView.style.display = 'block';
        generateQuizResults();
        if (window.innerWidth <= 768) {
          quizResultView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }

  function generateQuizResults() {
    const titleEl = $('#quiz-result-title');
    const summaryEl = $('#quiz-result-summary');
    const listEl = $('#quiz-talking-list');

    let title = 'Family Peace of Mind & Resilience Focus';
    let summary = 'Your primary goal is building stability and protection for the people you cherish most.';
    let points = [
      'Balancing current living costs with automated family protection and reserves.',
      'Eliminating blind spots in life insurance and emergency savings buffers.',
      'Establishing a clear roadmap that eliminates financial stress.'
    ];

    if (quizState.focus.includes('wealth')) {
      title = 'Long-Term Wealth Growth & Momentum';
      summary = 'You are focused on compounding your earnings and putting your money to work through disciplined, tax-smart investing.';
      points = [
        'Optimizing asset allocation across taxable and registered accounts.',
        'Setting up automated, stress-free monthly wealth building routines.',
        'Balancing risk and return with a 20+ year perspective.'
      ];
    } else if (quizState.focus.includes('retirement')) {
      title = 'Retirement Horizon & Sustainable Income';
      summary = 'You want clarity on when and how you can step into retirement without worrying about outliving your assets.';
      points = [
        'Modeling realistic monthly income and safe withdrawal sequencing.',
        'Setting up a cash buffer to weather market turbulence safely.',
        'Determining the optimal timing for pensions and healthcare reserves.'
      ];
    } else if (quizState.focus.includes('Organizing') || quizState.focus.includes('Consolidating')) {
      title = 'Financial Organization & Clarity';
      summary = 'Your immediate priority is cutting through clutter, reducing fees, and having a single unified picture of your assets.';
      points = [
        'Consolidating scattered accounts into one transparent framework.',
        'Uncovering hidden fees and simplifying your banking and investing.',
        'Creating an intuitive 1-page financial dashboard for your household.'
      ];
    }

    if (titleEl) titleEl.textContent = title;
    if (summaryEl) summaryEl.textContent = summary;
    if (listEl) {
      listEl.innerHTML = '';
      points.forEach(pt => {
        const li = document.createElement('li');
        li.textContent = pt;
        listEl.appendChild(li);
      });
    }
  }

  if (quizResetBtn) {
    quizResetBtn.addEventListener('click', () => {
      if (quizResultView) quizResultView.style.display = 'none';
      quizSteps.forEach((s, idx) => {
        if (s) s.style.display = idx === 0 ? 'block' : 'none';
      });
    });
  }

  if (quizApplyBtn) {
    quizApplyBtn.addEventListener('click', (e) => {
      window.open('https://cal.com/rupinderkalsi', '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // 9. DUAL INTERACTIVE FINANCIAL CALCULATORS
  // ==========================================================================
  // Tabs switcher
  const tabSavingsBtn = $('#tab-btn-savings');
  const tabRetirementBtn = $('#tab-btn-retirement');
  const paneSavings = $('#calc-pane-savings');
  const paneRetirement = $('#calc-pane-retirement');

  if (tabSavingsBtn && tabRetirementBtn) {
    tabSavingsBtn.addEventListener('click', () => {
      tabSavingsBtn.classList.add('active');
      tabRetirementBtn.classList.remove('active');
      tabSavingsBtn.setAttribute('aria-selected', 'true');
      tabRetirementBtn.setAttribute('aria-selected', 'false');
      paneSavings.hidden = false;
      paneRetirement.hidden = true;
      paneSavings.style.display = 'block';
      paneRetirement.style.display = 'none';
    });

    tabRetirementBtn.addEventListener('click', () => {
      tabRetirementBtn.classList.add('active');
      tabSavingsBtn.classList.remove('active');
      tabRetirementBtn.setAttribute('aria-selected', 'true');
      tabSavingsBtn.setAttribute('aria-selected', 'false');
      paneSavings.hidden = true;
      paneRetirement.hidden = false;
      paneSavings.style.display = 'none';
      paneRetirement.style.display = 'block';
      updateRetirementCalculator();
    });
  }

  // Calculator 1: Compound Savings
  function calculateFutureValue(monthly, years, annualRate) {
    const months = years * 12;
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return monthly * months;
    return monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  }

  function formatCurrency(val, currency = 'CAD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(Math.round(val));
  }

  function updateSavingsCalculator() {
    const monthlyInput = $('#monthly');
    const yearsInput = $('#years');
    const rateInput = $('#rate');
    const currencySelect = $('#currency');

    if (!monthlyInput || !yearsInput || !rateInput) return;

    const monthly = Number(monthlyInput.value);
    const years = Number(yearsInput.value);
    const rate = Number(rateInput.value);
    const currency = currencySelect ? currencySelect.value : 'CAD';

    const totalContributed = monthly * years * 12;
    const totalFutureValue = calculateFutureValue(monthly, years, rate);
    const totalGrowth = Math.max(0, totalFutureValue - totalContributed);

    // Update labels
    const monthlyValEl = $('#monthly-value');
    if (monthlyValEl) monthlyValEl.textContent = `${formatCurrency(monthly, currency)} / mo`;

    const yearsValEl = $('#years-value');
    if (yearsValEl) yearsValEl.textContent = `${years} ${years === 1 ? 'year' : 'years'}`;

    const rateValEl = $('#rate-value');
    if (rateValEl) rateValEl.textContent = `${rate.toFixed(1)}%`;

    const fvEl = $('#future-value');
    if (fvEl) fvEl.textContent = formatCurrency(totalFutureValue, currency);

    const contribEl = $('#contributions');
    if (contribEl) contribEl.textContent = formatCurrency(totalContributed, currency);

    const growthEl = $('#growth');
    if (growthEl) growthEl.textContent = formatCurrency(totalGrowth, currency);

    // Update split progress bar
    const barEl = $('#contribution-bar');
    if (barEl) {
      const contribRatio = totalFutureValue > 0 ? (totalContributed / totalFutureValue) * 100 : 100;
      barEl.style.width = `${Math.min(100, Math.max(0, contribRatio))}%`;
    }
  }

  ['monthly', 'years', 'rate', 'currency'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener('input', updateSavingsCalculator);
  });

  // Calculator 2: Retirement Income
  function updateRetirementCalculator() {
    const nestEggInput = $('#nest-egg');
    const withdrawalRateInput = $('#withdrawal-rate');

    if (!nestEggInput || !withdrawalRateInput) return;

    const nestEgg = Number(nestEggInput.value);
    const rate = Number(withdrawalRateInput.value);

    const annualIncome = nestEgg * (rate / 100);
    const monthlyIncome = annualIncome / 12;

    const nestEggValEl = $('#nest-egg-value');
    if (nestEggValEl) nestEggValEl.textContent = formatCurrency(nestEgg, 'USD');

    const rateValEl = $('#withdrawal-rate-value');
    if (rateValEl) rateValEl.textContent = `${rate.toFixed(1)}%`;

    const retMonthlyEl = $('#ret-monthly-value');
    if (retMonthlyEl) retMonthlyEl.textContent = `${formatCurrency(monthlyIncome, 'USD')} / mo`;

    const retAnnualEl = $('#ret-annual-value');
    if (retAnnualEl) retAnnualEl.textContent = `${formatCurrency(annualIncome, 'USD')} / yr`;
  }

  ['nest-egg', 'withdrawal-rate'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener('input', updateRetirementCalculator);
  });

  // Initial runs
  updateSavingsCalculator();
  updateRetirementCalculator();

  // ==========================================================================
  // 10. EDITORIAL ARTICLES / PERSPECTIVES MODAL
  // ==========================================================================
  const articlesData = {
    parenting: {
      category: 'Family Wealth & Values',
      title: 'The Family Wealth Playbook: Raising Financially Resilient Kids',
      body: `
        <p>As a mother of three and a financial advisor for over two decades, one of the most frequent questions parents ask me is: <em>"How do I teach my kids about money without passing along anxiety?"</em></p>
        <p>Children absorb their relationship with money through observation rather than lectures. Here are three practical pillars we recommend:</p>
        <ul style="padding-left: 20px; margin: 16px 0; display:flex; flex-direction:column; gap:10px;">
          <li><strong>The Three-Jar System for Young Children:</strong> Spend, Save, Give. Giving children agency over a small allowance cultivates trade-off thinking before adult stakes arise.</li>
          <li><strong>Demystify Everyday Family Trade-offs:</strong> When saying no to a purchase, replace <em>"We can't afford that"</em> with <em>"We are choosing to prioritize our family trip this summer."</em> This replaces a scarcity mindset with purposeful stewardship.</li>
          <li><strong>Involve Teens in Real Budgeting:</strong> Include older children in grocery budgeting, mobile phone plans, or vacation planning so the cost of living isn't an abrupt shock in college.</li>
        </ul>
        <p>Above all, remember that healthy family communication about money is the greatest inheritance you can pass along.</p>
      `
    },
    volatility: {
      category: 'Market Mindset & Resilience',
      title: 'Calm During Market Volatility: Why Discipline Beats Prediction',
      body: `
        <p>Market downturns are not glitches in the system; they are the price of admission for long-term compound growth. Yet during turbulent news cycles, emotional impulses often urge investors to <em>"do something."</em></p>
        <p>Here is why disciplined patience is your strongest investment ally:</p>
        <ul style="padding-left: 20px; margin: 16px 0; display:flex; flex-direction:column; gap:10px;">
          <li><strong>The Peril of Market Timing:</strong> Missing just the 10 best trading days across a 20-year span historically cuts overall portfolio returns in half. Those best days almost always occur in the immediate wake of sharp drawdowns.</li>
          <li><strong>The Cushion of Cash Reserves:</strong> When you know you have 6–12 months of living expenses (or 2–3 years in pre-retirement) safely parked in high-yield reserves, market dips cannot force you to liquidate equities at a loss.</li>
          <li><strong>Automated Rebalancing:</strong> Regular rebalancing forces you to buy quality assets when they are discounted, turning market corrections into long-term compounding engines.</li>
        </ul>
        <p>A good financial plan is specifically engineered so you never have to make panic-driven decisions during a storm.</p>
      `
    },
    'retirement-transition': {
      category: 'Retirement Horizon',
      title: 'Designing Retirement: Turning Your Nest Egg Into Monthly Peace',
      body: `
        <p>For 30 to 40 years, you were conditioned to save, accumulate, and watch your account balance grow. Then, one day, you cross the retirement threshold and must begin doing the exact opposite: <em>spending from your savings.</em></p>
        <p>For many retirees, this transition creates genuine cognitive dissonance and fear. Here is how we build psychological and financial calm:</p>
        <ul style="padding-left: 20px; margin: 16px 0; display:flex; flex-direction:column; gap:10px;">
          <li><strong>The Engineered "Paycheck":</strong> We set up an automated transfer on the 1st of every month from your investment reserve into your checking account. Your daily lifestyle flows exactly as it did during your working years.</li>
          <li><strong>Tax-Efficient Decumulation Sequencing:</strong> Strategic drawdown across registered funds, tax-free accounts, and non-registered capital minimizes your clawbacks and marginal tax rate.</li>
          <li><strong>Focusing on Life, Not Daily Tickers:</strong> With a structured withdrawal strategy, you don't need to check market headlines daily. Your monthly lifestyle is protected.</li>
        </ul>
        <p>Retirement is the beginning of your most liberating chapter. Let the numbers serve your life, not the other way around.</p>
      `
    }
  };

  $$('[data-article]').forEach(card => {
    const key = card.dataset.article;
    const btn = $('.read-article-btn', card);
    if (btn && articlesData[key]) {
      btn.addEventListener('click', () => {
        const art = articlesData[key];
        $('#article-category').textContent = art.category;
        $('#article-title').textContent = art.title;
        $('#article-body').innerHTML = art.body;
        openDialog(articleDialog);
      });
    }
  });

  const articleBookBtn = $('#article-book-btn');
  if (articleBookBtn && articleDialog) {
    articleBookBtn.addEventListener('click', (e) => {
      articleDialog.close();
      window.open('https://cal.com/rupinderkalsi', '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // 11. FAQ ACCORDION & CATEGORY FILTERING
  // ==========================================================================
  const faqCatBtns = $$('.faq-cat-btn');
  const faqItems = $$('.faq-list details');

  faqCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      faqCatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      faqItems.forEach(item => {
        const itemCat = item.dataset.cat;
        if (filter === 'all' || itemCat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // ==========================================================================
  // 12. PRIVACY & DISCLOSURE TRIGGERS & FOOTER YEAR
  // ==========================================================================
  const privacyBtn = $('#privacy-button');
  const privacyLinkBottom = $('#privacy-link-bottom');

  if (privacyBtn) {
    privacyBtn.addEventListener('click', () => openDialog(privacyDialog));
  }
  if (privacyLinkBottom) {
    privacyLinkBottom.addEventListener('click', () => openDialog(privacyDialog));
  }

  const yearEl = $('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ==========================================================================
  // 13. TESTIMONIAL REVIEW CAROUSEL CONTROLLER
  // ==========================================================================
  const testimonialContainer = $('#testimonial-carousel');
  const testimonialCards = $$('.testimonial-card');
  const tPrevBtn = $('#t-prev-btn');
  const tNextBtn = $('#t-next-btn');
  const tPlayPauseBtn = $('#t-playpause-btn');
  const tDots = $$('.t-dot');

  if (testimonialCards.length > 0) {
    let currentSlide = 0;
    let isPlaying = true;
    let autoPlayTimer = null;
    const slideDuration = 6500;

    function showSlide(index) {
      if (index < 0) {
        currentSlide = testimonialCards.length - 1;
      } else if (index >= testimonialCards.length) {
        currentSlide = 0;
      } else {
        currentSlide = index;
      }

      testimonialCards.forEach((card, idx) => {
        if (idx === currentSlide) {
          card.classList.add('active');
          card.setAttribute('aria-hidden', 'false');
        } else {
          card.classList.remove('active');
          card.setAttribute('aria-hidden', 'true');
        }
      });

      tDots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add('active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('active');
          dot.setAttribute('aria-selected', 'false');
        }
      });
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (isPlaying) {
        autoPlayTimer = setInterval(nextSlide, slideDuration);
      }
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    // Prev / Next button clicks
    if (tPrevBtn) {
      tPrevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
      });
    }

    if (tNextBtn) {
      tNextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
      });
    }

    // Dot indicators
    tDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetIdx = parseInt(dot.dataset.index, 10);
        if (!isNaN(targetIdx)) {
          showSlide(targetIdx);
          startAutoPlay();
        }
      });
    });

    // Play / Pause toggle
    if (tPlayPauseBtn) {
      const pauseIcon = $('.pause-icon', tPlayPauseBtn);
      const playIcon = $('.play-icon', tPlayPauseBtn);

      tPlayPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          tPlayPauseBtn.setAttribute('aria-label', 'Pause automatic slide rotation');
          if (pauseIcon) pauseIcon.style.display = 'block';
          if (playIcon) playIcon.style.display = 'none';
          startAutoPlay();
        } else {
          tPlayPauseBtn.setAttribute('aria-label', 'Start automatic slide rotation');
          if (pauseIcon) pauseIcon.style.display = 'none';
          if (playIcon) playIcon.style.display = 'block';
          stopAutoPlay();
        }
      });
    }

    // Pause on hover, resume on leave
    if (testimonialContainer) {
      testimonialContainer.addEventListener('mouseenter', stopAutoPlay);
      testimonialContainer.addEventListener('mouseleave', () => {
        if (isPlaying) startAutoPlay();
      });

      // Touch swipe support for mobile
      let touchStartX = 0;
      let touchEndX = 0;

      testimonialContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });

      testimonialContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX - touchEndX;
        if (Math.abs(diffX) > 45) {
          if (diffX > 0) {
            nextSlide(); // swipe left -> next
          } else {
            prevSlide(); // swipe right -> prev
          }
          startAutoPlay();
        }
      }, { passive: true });

      // Keyboard left/right arrow navigation
      testimonialContainer.setAttribute('tabindex', '0');
      testimonialContainer.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') {
          prevSlide();
          startAutoPlay();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
          startAutoPlay();
        }
      });
    }

    // Start rotation on load
    startAutoPlay();
  }

  // Helper escape function
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});
