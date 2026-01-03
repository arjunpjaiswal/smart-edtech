const { db } = require('./firebase');

async function checkRecentEvaluations() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking evaluations for student_local_123 on ${today}...`);

    const snapshot = await db.collection('evaluations')
        .where('studentId', '==', 'student_local_123')
        .get();

    if (snapshot.empty) {
        console.log("No evaluations found at all.");
        return;
    }

    let foundToday = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.submittedAt && data.submittedAt.startsWith(today)) {
            foundToday++;
            console.log('--- Document ID:', doc.id);
            console.log('Submitted At:', data.submittedAt);
            console.log('Weak Points:', data.evaluation?.weakPoints || 'MISSING');
            console.log('Is Evaluation Object?:', typeof data.evaluation === 'object');
        }
    });

    console.log(`\nFound ${foundToday} submissions from today.`);
}

checkRecentEvaluations().catch(console.error);
