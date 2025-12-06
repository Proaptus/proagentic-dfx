---
id: RUN-YYYY-MM-runbook-name
doc_type: runbook
title: "Runbook: [Service/System Name]"
status: draft
last_verified_at: YYYY-MM-DD
owner: "@team-ops"
on_call_team: "@team-on-call"
severity_levels: ["P0", "P1", "P2", "P3"]
---

# Runbook: [Service/System Name]

> **Operational Procedures**: On-call response guide for [service/system]

**On-Call Team**: @team-on-call
**Escalation**: @team-lead → @engineering-manager
**Last Verified**: YYYY-MM-DD

## Quick Links

- **Dashboard**: [Monitoring Dashboard](https://monitoring.example.com/service)
- **Logs**: [Log Aggregation](https://logs.example.com/service)
- **Alerts**: [Alert Manager](https://alerts.example.com/service)
- **Status Page**: [Public Status](https://status.example.com)

## Service Overview

**What It Does**: Brief description of the service's purpose

**Dependencies**:
- Database: PostgreSQL (primary, replica)
- External API: ServiceX
- Message Queue: RabbitMQ
- Cache: Redis

**SLOs**:
- Availability: 99.9%
- Response Time (P95): < 200ms
- Error Rate: < 0.1%

## Alert Triage

### Severity Levels

| Level | Response Time | Description | Example |
|-------|---------------|-------------|---------|
| **P0** | Immediate | Service down, data loss risk | Complete outage |
| **P1** | 15 minutes | Severe degradation | 50% error rate |
| **P2** | 1 hour | Partial degradation | Slow responses |
| **P3** | Next business day | Warning, no impact | Low disk space |

---

## Common Alerts

### Alert: "High Error Rate"

**Severity**: P1

**Trigger**: Error rate > 5% for 5 minutes

**What It Means**: More than 5% of requests are failing

**Impact**:
- Users experiencing errors
- Some features may be unavailable
- Data processing may be delayed

**Quick Check**:

```bash
# Check error rate
curl https://api.example.com/metrics | grep error_rate

# Check recent errors
tail -100 /var/log/service/errors.log
```

**Common Causes**:
1. Database connection pool exhausted
2. External API timeout
3. Recent deployment bug
4. Infrastructure issue

**Investigation Steps**:

1. **Check Dashboard**
   - Go to [Monitoring Dashboard](https://monitoring.example.com/service)
   - Look at error rate trend
   - Identify which endpoints are failing

2. **Check Logs**
   ```bash
   # Recent errors
   tail -500 /var/log/service/errors.log | grep ERROR

   # Filter by endpoint
   grep "POST /api/users" /var/log/service/errors.log
   ```

3. **Check Dependencies**
   ```bash
   # Database connections
   psql -c "SELECT count(*) FROM pg_stat_activity;"

   # Redis status
   redis-cli INFO | grep connected_clients

   # External API
   curl https://external-api.example.com/health
   ```

4. **Check Recent Deployments**
   ```bash
   # Recent deployments
   kubectl get deployments -o wide | grep service-name

   # Rollback if needed (see Rollback section)
   ```

**Resolution**:

**If database connection issue**:
```bash
# Restart database connection pool
kubectl exec -it pod-name -- /app/scripts/restart-pool.sh

# Verify fixed
curl https://api.example.com/health
```

**If external API timeout**:
```bash
# Enable circuit breaker
kubectl set env deployment/service CIRCUIT_BREAKER=enabled

# Verify
kubectl logs deployment/service | grep "circuit breaker"
```

**If recent deployment**:
```bash
# Rollback to previous version (see Rollback Procedure)
kubectl rollout undo deployment/service

# Verify
kubectl rollout status deployment/service
```

**Verification**:
- Error rate drops below 1%
- Dashboard shows green
- Sample requests succeed

**Prevention**:
- Review code changes that caused issue
- Add tests to prevent regression
- Update monitoring thresholds if needed

---

### Alert: "Service Down"

**Severity**: P0

**Trigger**: All health checks failing for 2 minutes

**What It Means**: Service is completely unavailable

**Impact**:
- All users affected
- All features unavailable
- Data processing stopped

**Immediate Action** (within 2 minutes):

1. **Acknowledge Alert**
   ```bash
   # Acknowledge in PagerDuty/incident system
   incident acknowledge --id=INCIDENT_ID
   ```

2. **Check Service Status**
   ```bash
   # Check if pods are running
   kubectl get pods -l app=service-name

   # Check recent crashes
   kubectl get events --sort-by='.lastTimestamp' | head -20
   ```

3. **Quick Restart** (if safe):
   ```bash
   # Restart service
   kubectl rollout restart deployment/service

   # Watch restart
   kubectl rollout status deployment/service
   ```

4. **Communicate**
   - Update status page: "Investigating service outage"
   - Post in #incidents Slack channel
   - Notify stakeholders if outage > 5 minutes

**Investigation**:

1. **Check Pod Logs**
   ```bash
   # Recent logs
   kubectl logs deployment/service --tail=500

   # Crash logs
   kubectl logs deployment/service --previous
   ```

2. **Check Resources**
   ```bash
   # CPU/Memory usage
   kubectl top pods -l app=service-name

   # Node status
   kubectl get nodes
   ```

3. **Check Dependencies**
   ```bash
   # Database
   psql -h db-host -U user -c "SELECT 1;"

   # Redis
   redis-cli -h redis-host PING

   # External APIs
   curl https://external-api.example.com/health
   ```

**Resolution Options**:

**Option 1: Quick Restart** (if pod crashed):
```bash
kubectl rollout restart deployment/service
```

**Option 2: Scale Up** (if resource exhaustion):
```bash
kubectl scale deployment/service --replicas=6
```

**Option 3: Rollback** (if bad deployment):
```bash
kubectl rollout undo deployment/service
```

**Option 4: Infrastructure Issue** (escalate):
- Contact infrastructure team
- Check cloud provider status page

**Post-Incident**:
- Write postmortem (template below)
- Schedule blameless retrospective
- Create prevention tasks

---

### Alert: "Slow Response Time"

**Severity**: P2

**Trigger**: P95 response time > 500ms for 10 minutes

**What It Means**: Service is slow but functional

**Investigation**:

```bash
# Check slow queries
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check cache hit rate
redis-cli INFO | grep keyspace_hits

# Check external API latency
curl -w "@curl-format.txt" https://external-api.example.com/endpoint
```

**Common Fixes**:
- Add database index
- Increase cache TTL
- Enable query result caching
- Scale horizontally

---

## Playbooks

### Playbook: Rollback Deployment

**When to Use**: After bad deployment causing errors

**Steps**:

1. **Verify bad deployment**
   ```bash
   kubectl rollout history deployment/service
   ```

2. **Rollback**
   ```bash
   # Rollback to previous
   kubectl rollout undo deployment/service

   # Rollback to specific revision
   kubectl rollout undo deployment/service --to-revision=3
   ```

3. **Verify**
   ```bash
   # Check rollout status
   kubectl rollout status deployment/service

   # Check error rate
   curl https://api.example.com/metrics | grep error_rate
   ```

4. **Communicate**
   - Update incident: "Rolled back to version X"
   - Post in #deployments channel

---

### Playbook: Scale Service

**When to Use**: High traffic or slow response times

**Steps**:

1. **Check current scale**
   ```bash
   kubectl get deployment/service
   ```

2. **Scale up**
   ```bash
   # Manual scaling
   kubectl scale deployment/service --replicas=10

   # Or enable autoscaling
   kubectl autoscale deployment/service --min=5 --max=20 --cpu-percent=70
   ```

3. **Verify**
   ```bash
   kubectl get pods -l app=service-name -w
   ```

4. **Monitor**
   - Watch response times improve
   - Check CPU/memory usage

---

### Playbook: Database Emergency

**When to Use**: Database connection failures, slow queries

**Steps**:

1. **Check database health**
   ```bash
   psql -c "SELECT version();"
   psql -c "SELECT count(*) FROM pg_stat_activity;"
   ```

2. **Check slow queries**
   ```bash
   psql -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 10;"
   ```

3. **Kill long-running queries** (if needed):
   ```bash
   psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;"
   ```

4. **Restart connection pool** (application side):
   ```bash
   kubectl exec -it pod-name -- /app/scripts/restart-pool.sh
   ```

5. **Escalate to DBA** if issue persists

---

## Maintenance Procedures

### Planned Maintenance

**Before**:
1. Schedule maintenance window (communicate 48h advance)
2. Update status page
3. Notify stakeholders

**During**:
1. Enable maintenance mode
   ```bash
   kubectl set env deployment/service MAINTENANCE_MODE=true
   ```
2. Perform changes
3. Test thoroughly

**After**:
1. Disable maintenance mode
2. Verify service health
3. Update status page (all clear)
4. Post-maintenance report

---

### Database Migration

**Pre-Migration**:
1. Backup database
   ```bash
   pg_dump -h db-host -U user database > backup-$(date +%Y%m%d).sql
   ```
2. Test migration on staging
3. Prepare rollback script

**Migration**:
```bash
# Run migration
npm run migrate:up

# Verify
npm run migrate:status
```

**Rollback** (if needed):
```bash
npm run migrate:down
```

---

## Escalation

### Escalation Path

1. **On-Call Engineer**: @team-on-call (PagerDuty)
2. **Team Lead**: @team-lead (if > 15 min)
3. **Engineering Manager**: @eng-manager (if > 30 min or P0)
4. **VP Engineering**: @vp-eng (if > 1 hour or major outage)

### When to Escalate

- P0 incident not resolved in 15 minutes
- P1 incident not resolved in 1 hour
- Data loss risk
- Security incident
- Unsure how to proceed

### External Escalation

- **Database Issues**: DBA team (@dba-team)
- **Infrastructure**: Platform team (@platform-team)
- **Network**: Network ops (@network-ops)
- **Security**: Security team (@security-team)

---

## Postmortem Template

After P0/P1 incidents, write postmortem:

```markdown
# Postmortem: [Incident Name]

**Date**: YYYY-MM-DD
**Duration**: X hours Y minutes
**Severity**: P0 / P1
**Impact**: Number of affected users, features impacted

## Timeline (UTC)

- HH:MM - Incident start
- HH:MM - Alert fired
- HH:MM - Investigation began
- HH:MM - Root cause identified
- HH:MM - Fix applied
- HH:MM - Incident resolved

## Root Cause

What actually caused the incident.

## Impact

- Users affected: X
- Requests failed: Y
- Revenue impact: $Z (if applicable)

## Resolution

How it was fixed.

## Prevention

What we'll do to prevent this:
1. Action item 1 (owner: @person, due: date)
2. Action item 2 (owner: @person, due: date)

## Lessons Learned

What we learned from this.
```

---

## Contacts

| Role | Contact | Backup |
|------|---------|--------|
| On-Call Engineer | @on-call (PagerDuty) | - |
| Team Lead | @team-lead | @team-lead-backup |
| DBA | @dba-team | @dba-backup |
| Platform Team | @platform-team | @platform-backup |

---

## Related Documentation

- [Architecture Diagram](../explanation/architecture.md)
- [Deployment Guide](../howto/deploying.md)
- [Monitoring Setup](../howto/monitoring-setup.md)

---

**Last Updated**: YYYY-MM-DD
**Next Review**: YYYY-MM-DD
**Maintained By**: @team-ops
