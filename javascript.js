
    // small helpers
(function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // data-scroll buttons for better separation of concerns
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-scroll]');
    if(!btn) return;
    const target = document.querySelector(btn.getAttribute('data-scroll'));
    if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
  });

  // accessible keyboard focus for project cards
  document.querySelectorAll('.project').forEach((p)=>{p.setAttribute('tabindex', '0')});

  // simple tap animation on project cards
  const grid = document.getElementById('projects-grid');
  if(grid){
    grid.addEventListener('click', (e)=>{
      const card = e.target.closest('.project');
      if(!card) return;
      card.style.transform='translateY(-2px)';
      setTimeout(()=>card.style.transform='',220);
    });
  }
})();
  