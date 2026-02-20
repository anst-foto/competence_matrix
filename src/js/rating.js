// rating.js - скрипт для самооценки
(function () {
  const STORAGE_KEY = 'competence_ratings';

  function loadRatings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const ratings = JSON.parse(saved);
      document.querySelectorAll('#matrix-table tbody tr').forEach((row) => {
        const id = row.dataset.id;
        if (id && ratings[id]) {
          const inputs = row.querySelectorAll('.rating-input');
          inputs.forEach((input) => {
            const type = input.dataset.type;
            if (ratings[id][type] !== undefined) {
              input.value = ratings[id][type];
            }
          });
        }
      });
    }
  }

  function saveRating(id, type, value) {
    const saved = localStorage.getItem(STORAGE_KEY);
    const ratings = saved ? JSON.parse(saved) : {};
    if (!ratings[id]) ratings[id] = {};
    ratings[id][type] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  }

  function resetRatings() {
    if (confirm('Сбросить все введённые оценки?')) {
      localStorage.removeItem(STORAGE_KEY);
      document.querySelectorAll('.rating-input').forEach((input) => (input.value = ''));
    }
  }

  function exportToCSV() {
    const rows = [];
    const header = [
      'Категория',
      'Подкатегория',
      'Навык',
      'Тип',
      'Самооценка',
      'Частота',
      'Уверенность',
      'Дата',
      'Примечание',
    ];
    rows.push(header.join(';'));

    const tbody = document.querySelector('#matrix-table tbody');
    const trs = tbody.querySelectorAll('tr');

    trs.forEach((tr) => {
      const inputs = tr.querySelectorAll('.rating-input');
      if (inputs.length > 0) {
        const cells = tr.querySelectorAll('td');
        const category = cells[0]?.innerText || '';
        const subcategory = cells[1]?.innerText || '';
        const skill = cells[2]?.innerText || '';
        const type = cells[3]?.innerText || '';
        const self = inputs[0]?.value || '';
        const freq = inputs[1]?.value || '';
        const conf = inputs[2]?.value || '';
        const date = inputs[3]?.value || '';
        const note = inputs[4]?.value || '';
        rows.push([category, subcategory, skill, type, self, freq, conf, date, note].join(';'));
      }
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'competence_ratings.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadRatings();

    document.querySelectorAll('.rating-input').forEach((input) => {
      input.addEventListener('change', function () {
        const row = this.closest('tr');
        const id = row.dataset.id;
        const type = this.dataset.type;
        saveRating(id, type, this.value);
      });
    });

    document.getElementById('export-btn').addEventListener('click', exportToCSV);
    document.getElementById('reset-btn').addEventListener('click', resetRatings);
  });
})();
