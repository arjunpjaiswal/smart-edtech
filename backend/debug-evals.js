const { db } = require('./firebase');

async function checkEvaluations() {
    console.log("Checking evaluations for student_local_123...");
    const snapshot = await db.collection('evaluations')
        .where('studentId', '==', 'student_local_123')
        .get();

    if (snapshot.empty) {
        console.log("No evaluations found for this student.");
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log('--- Document ID:', doc.id);
        console.log('Assignment:', data.assignmentId);
        console.log('Date:', data.submittedAt);
        console.log('Evaluation Structure:', JSON.stringify(data.evaluation, null, 2));
    });
}

checkEvaluations().catch(console.error);
