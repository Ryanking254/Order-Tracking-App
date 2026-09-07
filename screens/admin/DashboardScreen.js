import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Headline, Paragraph } from 'react-native-paper';
import { adminAPI } from '../../services/api';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const cards = stats
    ? [
        { label: "Today's Orders", value: stats.today_orders, icon: 'package-variant' },
        { label: 'Pending Orders', value: stats.pending_orders, icon: 'clock-outline' },
        { label: 'Active Deliveries', value: stats.active_deliveries, icon: 'truck' },
        { label: 'Completed Today', value: stats.completed_today, icon: 'check-circle' },
        { label: "Today's Revenue", value: `KES ${stats.today_revenue}`, icon: 'wallet' },
        { label: 'Avg Order Value', value: `KES ${Number(stats.avg_order_value || 0).toFixed(2)}`, icon: 'chart-line' },
        { label: 'Total Customers', value: stats.total_customers, icon: 'account-group' },
      ]
    : [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}
    >
      <Headline style={styles.title}>Owner Dashboard</Headline>
      {cards.map((card) => (
        <Card key={card.label} style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Headline style={styles.value}>{card.value}</Headline>
            <Paragraph>{card.label}</Paragraph>
          </Card.Content>
        </Card>
      ))}
      {!stats && !loading && (
        <Paragraph style={styles.empty}>No stats available</Paragraph>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginVertical: 15,
  },
  card: {
    marginBottom: 10,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  value: {
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
  },
});
