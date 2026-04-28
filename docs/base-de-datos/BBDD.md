Información del proyecto

motor de base de datos: postgresql
base de datos: siiac
usuario: siiac2026
password: siiac2026
esquema: public

Listado de tablas

| # | table_name | column_name | data_type | is_nullable | column_default |
|---|---|---|---|---|---|
1  |archderiva          |solicitudid                   |integer                    |NO         |              |
2  |archderiva          |archderivaid                  |integer                    |NO         |              |
3  |archderiva          |archderivaattach              |bytea                      |YES        |              |
4  |archderiva          |archderivanombre              |character                  |YES        |              |
5  |archderiva          |archderivaext                 |character                  |YES        |              |
6  |archentrega         |solicitud_id                  |integer                    |NO         |              |
7  |archentrega         |archentregaid                 |smallint                   |NO         |              |
8  |archentrega         |archentregaattach             |bytea                      |YES        |              |
9  |archentrega         |archentreganombre             |character                  |YES        |              |
10 |archentrega         |archentregaext                |character                  |YES        |              |
11 |archivos            |archivosid                    |integer                    |NO         |              |
12 |archivos            |solicitudid                   |integer                    |YES        |              |
13 |archivos            |usuario_id                    |character                  |YES        |              |
14 |archivos            |archivospath                  |character                  |YES        |              |
15 |archivos            |archivosfecha                 |timestamp without time zone|YES        |              |
16 |archivos            |archivosidentificador         |integer                    |YES        |              |
17 |archivosfap         |solicitudfapid                |integer                    |NO         |              |
18 |archivosfap         |archivosfapid                 |smallint                   |NO         |              |
19 |archivosfap         |archivosfapattach             |bytea                      |YES        |              |
20 |archivosfap         |archivosfapnombre             |character                  |YES        |              |
21 |archivosfap         |archivosfapext                |character                  |YES        |              |
22 |area                |areaid                        |smallint                   |NO         |              |
23 |area                |areadescripcion               |character                  |YES        |              |
24 |area                |areahabilitado                |smallint                   |YES        |              |
25 |areafap             |areafapid                     |smallint                   |NO         |              |
26 |areafap             |areafapdescripcion            |character                  |YES        |              |
27 |areafap             |areafaphabilitado             |smallint                   |YES        |              |
28 |auditor             |auditorid                     |integer                    |NO         |              |
29 |auditor             |solicitudid                   |integer                    |YES        |              |
30 |auditor             |auditorfecha                  |timestamp without time zone|YES        |              |
31 |auditor             |estado_id                     |smallint                   |YES        |              |
32 |auditor             |estadoanterior                |smallint                   |YES        |              |
33 |auditor             |usuarios_id                   |character                  |YES        |              |
34 |auditor             |usuarioanterior               |character                  |YES        |              |
35 |auditor             |auditorobservacion            |character                  |YES        |              |
36 |campana             |campanaid                     |smallint                   |NO         |              |
37 |campana             |campanadescripcion            |text                       |YES        |              |
38 |campana             |campanahabilitado             |smallint                   |YES        |              |
39 |campana             |campanasistema                |smallint                   |YES        |              |
40 |cargo               |cargoid                       |smallint                   |NO         |              |
41 |cargo               |cargodescripcion              |character                  |YES        |              |
42 |ciudadano           |ciudadanorut                  |integer                    |NO         |              |
43 |ciudadano           |ciudadanodv                   |character                  |YES        |              |
44 |ciudadano           |ciudadanonombres              |character                  |YES        |              |
45 |ciudadano           |ciudadanopaterno              |character                  |YES        |              |
46 |ciudadano           |ciudadanomaterno              |character                  |YES        |              |
47 |ciudadano           |ciudadanotelefono1            |character                  |YES        |              |
48 |ciudadano           |ciudadanotelefono2            |character                  |YES        |              |
49 |ciudadano           |ciudadanoemail                |character                  |YES        |              |
50 |ciudadano           |ciudadanocorepa               |integer                    |YES        |              |
51 |ciudadano           |ciudadanoinstitucion          |character                  |YES        |              |
52 |ciudadano           |ocupacionid                   |smallint                   |YES        |              |
53 |ciudadano           |generoid                      |smallint                   |YES        |              |
54 |ciudadano           |paisid                        |smallint                   |YES        |              |
55 |ciudadano           |edadid                        |smallint                   |YES        |              |
56 |ciudadano           |nombrecompleto                |character                  |YES        |              |
57 |ciudadano           |ciudadanorutguion             |character                  |YES        |              |
58 |ciudadano           |ciudadanoregion               |smallint                   |YES        |              |
59 |ciudadano           |pueblosid                     |smallint                   |YES        |              |
60 |ciudadano           |ciudadanootrotipo             |character                  |YES        |              |
61 |ciudadano           |ciudadanocargoid              |smallint                   |YES        |              |
62 |ciudadano           |ciudadanoinstitucionid        |smallint                   |YES        |              |
63 |ciudadano           |ciudadanonombreotrainstitucion|character                  |YES        |              |
64 |ciudadano           |ciudadanocomunainstitucion    |integer                    |YES        |              |
65 |ciudadano           |ciudadanoregioninstitucion    |smallint                   |YES        |              |
66 |ciudadano           |ciudadanotipoinstitucion      |smallint                   |YES        |              |
67 |ciudadano           |ciudadanoorigen               |smallint                   |YES        |              |
68 |ciudadano           |ciudadanooficinafap           |smallint                   |YES        |              |
69 |ciudadano           |ciudadanopreferenteid         |smallint                   |YES        |              |
70 |ciudadano           |ciudadanoconsultanteid        |smallint                   |YES        |              |
71 |ciudadano           |ciudadanocuidador             |smallint                   |YES        |              |
72 |ciudadano           |sexoid                        |smallint                   |YES        |              |
73 |ciudadano           |ciudadanootropais             |character                  |YES        |              |
74 |ciudadano           |ciudadanotipoid               |smallint                   |YES        |              |
75 |ciudadano           |ciudadanonacionalidad         |smallint                   |YES        |              |
76 |ciudadano           |ciudadanootraocupacion        |character                  |YES        |              |
77 |ciudadanotipo       |ciudadanotipoid               |smallint                   |NO         |              |
78 |ciudadanotipo       |ciudadanotipodescripcion      |character                  |YES        |              |
79 |clasificacion       |clasificacionid               |smallint                   |NO         |              |
80 |clasificacion       |clasificaciondescripcion      |character                  |YES        |              |
81 |clasificacion       |clasificacionhabilitado       |smallint                   |YES        |              |
82 |consultantetipo     |consultantetipoid             |smallint                   |NO         |              |
83 |consultantetipo     |consultantetipodescripcion    |character                  |YES        |              |
84 |corepa              |comunaid                      |integer                    |NO         |              |
85 |corepa              |provinciaid                   |smallint                   |YES        |              |
86 |corepa              |comunadescripcion             |character                  |YES        |              |
87 |descripcion         |descripcionid                 |smallint                   |NO         |              |
88 |descripcion         |descripciondescripcion        |character                  |YES        |              |
89 |descripcion         |descripcionhabilitado         |smallint                   |YES        |              |
90 |despacho            |despachoid                    |integer                    |NO         |              |
91 |despacho            |solicitud_id                  |integer                    |YES        |              |
92 |despacho            |despachofecha                 |timestamp without time zone|YES        |              |
93 |despacho            |despachoorigen                |character                  |YES        |              |
94 |despacho            |despachodestino               |character                  |YES        |              |
95 |despacho            |despachotitulo                |character                  |YES        |              |
96 |despacho            |despachoestado                |smallint                   |YES        |              |
97 |despacho            |despachomensaje               |text                       |YES        |              |
98 |despacho            |despachoattach                |bytea                      |YES        |              |
99 |despacho            |despachonombreattach          |character                  |YES        |              |
100|despacho            |despachousuarioold            |character                  |YES        |              |
