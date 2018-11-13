
-- PRINICPAL MAKE REQUIRED

// Principal COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC

// DIAG IMP 1 - 7

// 1 COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.principal_diagnosis_code
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC

// 2 COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
AND (DIAGE.icd_code <> :user_pps_mh_NonEpisodic.principal_diagnosis_code AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_1)
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC

// 3 COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
AND (DIAGE.icd_code <> :user_pps_mh_NonEpisodic.principal_diagnosis_code AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_1 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_2)
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC

// 4 COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
AND (DIAGE.icd_code <> :user_pps_mh_NonEpisodic.principal_diagnosis_code AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_1 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_2 AND 
DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_3)
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC

// 5 COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
AND (DIAGE.icd_code <> :user_pps_mh_NonEpisodic.principal_diagnosis_code AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_1 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_2 
AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_3 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_4)
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC

// 6 COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
AND (DIAGE.icd_code <> :user_pps_mh_NonEpisodic.principal_diagnosis_code AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_1 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_2 
AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_3 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_4 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_5)
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC

// 7 COPY and PASTE BELOW IN TO SQL FIELD IN FORM DEFINITION

select DIAGE.icd_code, REPLACE(STRING(CASE WHEN EP.date_of_discharge IS NULL THEN 'Active - ' ELSE 'Discharged - ' END ,'Episode', CASE WHEN COUNT(EP.PATID) > 1 THEN 's' ELSE '' END, ': ',
 LIST(DISTINCT EP.program_value),' - Diagnosis Code: ',DIAGE.icd_code, ' (',
DIAGE.clinical_search_term, ') - Ranking: ' ,DIAGE.ranking_value,' - Classification: '
,DIAGE.classification_value), ',' ,' / ') INTO :CODE,:VALUE
FROM SYSTEM.episode_history as EP
INNER JOIN SYSTEM.client_diagnosis_record DIAGR ON EP.PATID = DIAGR.PATID AND DIAGR.EPISODE_NUMBER = EP.EPISODE_NUMBER
INNER JOIN SYSTEM.client_diagnosis_entry DIAGE ON DIAGE.DiagnosisRecord = DIAGR.ID AND DIAGE.PATID = DIAGR.PATID
INNER JOIN SYSTEM.client_diagnosis_codes AS DIAGC ON DIAGE.ID = DIAGC.DiagnosisEntry AND DIAGE.PATID = DIAGC.PATID
WHERE EP.PATID=:ID AND DIAGE.diagnosis_status_code= '1' AND DIAGC.code_set_code = 'ICD10' AND (DIAGE.classification_code in ('4','7') or DIAGE.classification_code IS NULL)
AND (DIAGE.icd_code <> :user_pps_mh_NonEpisodic.principal_diagnosis_code AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_1 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_2 
AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_3 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_4 AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_5
AND DIAGE.icd_code <> :user_pps_mh_NonEpisodic.diagnostic_impression_6)
GROUP BY DIAGE.icd_code
ORDER BY EP.date_of_discharge ASC, EP.preadmit_admission_date DESC