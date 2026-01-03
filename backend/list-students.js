const { db } = require('./firebase');

async function listStudents() {
    const snapshot = await db.collection('evaluations').get();
    const students = new Set();
    snapshot.forEach(doc => {
        students.add(doc.data().studentId);
    });
    console.log('Unique Students:', Array.from(students));

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.studentId && data.studentId !== 'student_local_123') {
            console.log(`Document ${doc.id} has ID: ${data.studentId}`);
        }
    });
}

listStudents().catch(console.error);
