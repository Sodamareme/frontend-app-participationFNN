import * as XLSX from 'xlsx';

function downloadWorkbook(rows, sheetName, filename) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

// Export des versements d'un tour (caisse tournante), en incluant aussi ceux qui n'ont pas encore versé
export function exportTourWithNonContributorsToExcel(contributions, nonContributors, filename = 'tour.xlsx') {
  const rows = [
    ...contributions.map((c) => ({
      Participant: c.full_name,
      Email: c.email,
      Statut: 'A versé',
      'Montant (FCFA)': Number(c.amount),
      Date: new Date(c.created_at).toLocaleString('fr-FR'),
      Capture: c.screenshot_url ? 'Oui' : 'Non',
    })),
    ...nonContributors.map((m) => ({
      Participant: m.full_name,
      Email: m.email,
      Statut: "N'a pas encore versé",
      'Montant (FCFA)': 0,
      Date: '—',
      Capture: '—',
    })),
  ];
  downloadWorkbook(rows, 'Tour', filename);
}

// Export d'une liste de versements (caisse classique)
export function exportContributionsToExcel(contributions, filename = 'versements.xlsx') {
  const rows = contributions.map((c) => ({
    Participant: c.full_name,
    Email: c.email,
    'Montant (FCFA)': Number(c.amount),
    Date: new Date(c.created_at).toLocaleString('fr-FR'),
    Capture: c.screenshot_url ? 'Oui' : 'Non',
  }));
  downloadWorkbook(rows, 'Versements', filename);
}



// Export de l'historique des tours d'une caisse tournante — une ligne par contributeur
// (plutôt qu'une ligne résumée par tour), pour voir qui a cotisé pour qui et quand
export function exportToursToExcel(tours, filename = 'tours.xlsx') {
  const rows = [];

  tours.forEach((t) => {
    const hasContributions = t.contributions && t.contributions.length > 0;
    const hasNonContributors = t.non_contributors && t.non_contributors.length > 0;

    if (!hasContributions && !hasNonContributors) {
      rows.push({
        Bénéficiaire: t.beneficiary_name,
        'Date du tour': new Date(t.tour_date).toLocaleDateString('fr-FR'),
        Participant: '—',
        Email: '—',
        Statut: '—',
        'Montant (FCFA)': 0,
        'Date du versement': '—',
      });
      return;
    }

    (t.contributions || []).forEach((c) => {
      rows.push({
        Bénéficiaire: t.beneficiary_name,
        'Date du tour': new Date(t.tour_date).toLocaleDateString('fr-FR'),
        Participant: c.full_name,
        Email: c.email,
        Statut: 'A versé',
        'Montant (FCFA)': Number(c.amount),
        'Date du versement': new Date(c.created_at).toLocaleString('fr-FR'),
      });
    });

    (t.non_contributors || []).forEach((m) => {
      rows.push({
        Bénéficiaire: t.beneficiary_name,
        'Date du tour': new Date(t.tour_date).toLocaleDateString('fr-FR'),
        Participant: m.full_name,
        Email: m.email,
        Statut: "N'a pas versé",
        'Montant (FCFA)': 0,
        'Date du versement': '—',
      });
    });
  });

  downloadWorkbook(rows, 'Historique des tours', filename);
}
// Export de la liste des participants d'une caisse (avec leur total versé + statut de contribution)
export function exportMembersToExcel(members, filename = 'participants.xlsx') {
  const rows = members.map((m) => ({
    Nom: m.full_name,
    Email: m.email,
    Rôle: m.role === 'admin' ? 'Responsable' : 'Membre',
    Statut: Number(m.total_amount) > 0 ? 'A contribué' : "N'a pas contribué",
    'Total versé (FCFA)': Number(m.total_amount),
  }));
  downloadWorkbook(rows, 'Participants', filename);
}

// Nettoie un nom de caisse pour un usage sûr dans un nom de fichier
export function slugifyFilename(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}