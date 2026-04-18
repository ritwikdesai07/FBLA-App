import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Image } from 'react-native';
import { AllReminders, CalendarType, emptyReminders, getCurrentUser } from '@/lib/authStorage';

const FBLA_BLUE = '#003DA5';

const parseLocalDate = (dateStr: string) => {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
};

const formatReminderDate = (dateStr: string) =>
	parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function HomeScreen() {
	const [allReminders, setAllReminders] = useState<AllReminders>(emptyReminders());
	const [name, setName] = useState('');

	useEffect(() => {
		let mounted = true;
		const load = async () => {
			try {
				const user = await getCurrentUser();
				if (!mounted) return;
				setName(user?.displayName ?? '');
				setAllReminders(user?.reminders ?? emptyReminders());
			} catch (e) {
				console.error('Failed loading home data', e);
			}
		};

		load();
		const interval = setInterval(load, 1000);
		return () => {
			mounted = false;
			clearInterval(interval);
		};
	}, []);

	const upcoming = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const oneWeekAway = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

		const list: Array<{ date: string; title: string; notes: string; type: CalendarType }> = [];
		const types: CalendarType[] = ['FBLA National', 'FBLA State', 'FBLA Regional'];
		types.forEach((t) => {
			const reminders = allReminders[t] ?? {};
			Object.entries(reminders).forEach(([dateStr, rems]) => {
				const d = parseLocalDate(dateStr);
				if (d >= today && d <= oneWeekAway) {
					rems.forEach((r) => list.push({ date: dateStr, title: r.title, notes: r.notes, type: t }));
				}
			});
		});

		return list.sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
	}, [allReminders]);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.banner}>
					<Text style={styles.greeting}>{`Good day${name ? ', ' + name : ''}`}</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Upcoming This Week</Text>
					{upcoming.length === 0 ? (
						<Text style={styles.empty}>No reminders set for the next 7 days</Text>
					) : (
						upcoming.map((u, idx) => (
							<View key={idx} style={styles.reminderRow}>
								<Text style={styles.reminderDate}>{formatReminderDate(u.date)}</Text>
								<View style={{ flex: 1 }}>
									<Text style={styles.reminderTitle}>{u.title}</Text>
									{u.notes ? <Text style={styles.reminderNotes}>{u.notes}</Text> : null}
								</View>
							</View>
						))
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	content: { padding: 16 },
	banner: { backgroundColor: FBLA_BLUE, padding: 24, borderRadius: 12, marginBottom: 12 },
	greeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
	section: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
	sectionTitle: { fontSize: 16, fontWeight: '700', color: FBLA_BLUE, marginBottom: 10 },
	empty: { color: '#666', textAlign: 'center', paddingVertical: 12 },
	reminderRow: { flexDirection: 'row', marginBottom: 12 },
	reminderDate: { width: 70, color: FBLA_BLUE, fontWeight: '700' },
	reminderTitle: { fontWeight: '700' },
	reminderNotes: { color: '#666' },
});

