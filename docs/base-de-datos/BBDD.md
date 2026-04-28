Información del proyecto

motor de base de datos: postgresql
base de datos: siiac
usuario: siiac2026
password: siiac2026
esquema: public

Listado de tablas

| # | table_schema | table_name | column_name | data_type | is_nullable |
|---:|---|---|---|---|---|
| 1  |public      |archderiva          |solicitudid                   |integer                    |NO         |
| 2  |public      |archderiva          |archderivaid                  |integer                    |NO         |
| 3  |public      |archderiva          |archderivaattach              |bytea                      |YES        |
| 4  |public      |archderiva          |archderivanombre              |character                  |YES        |
| 5  |public      |archderiva          |archderivaext                 |character                  |YES        |
| 6  |public      |archentrega         |solicitud_id                  |integer                    |NO         |
| 7  |public      |archentrega         |archentregaid                 |smallint                   |NO         |
| 8  |public      |archentrega         |archentregaattach             |bytea                      |YES        |
| 9  |public      |archentrega         |archentreganombre             |character                  |YES        |
| 10 |public      |archentrega         |archentregaext                |character                  |YES        |
| 11 |public      |archivos            |archivosid                    |integer                    |NO         |
| 12 |public      |archivos            |solicitudid                   |integer                    |YES        |
| 13 |public      |archivos            |usuario_id                    |character                  |YES        |
| 14 |public      |archivos            |archivospath                  |character                  |YES        |
| 15 |public      |archivos            |archivosfecha                 |timestamp without time zone|YES        |
| 16 |public      |archivos            |archivosidentificador         |integer                    |YES        |
| 17 |public      |archivosfap         |solicitudfapid                |integer                    |NO         |
| 18 |public      |archivosfap         |archivosfapid                 |smallint                   |NO         |
| 19 |public      |archivosfap         |archivosfapattach             |bytea                      |YES        |
| 20 |public      |archivosfap         |archivosfapnombre             |character                  |YES        |
| 21 |public      |archivosfap         |archivosfapext                |character                  |YES        |
| 22 |public      |area                |areaid                        |smallint                   |NO         |
| 23 |public      |area                |areadescripcion               |character                  |YES        |
| 24 |public      |area                |areahabilitado                |smallint                   |YES        |
| 25 |public      |areafap             |areafapid                     |smallint                   |NO         |
| 26 |public      |areafap             |areafapdescripcion            |character                  |YES        |
| 27 |public      |areafap             |areafaphabilitado             |smallint                   |YES        |
| 28 |public      |auditor             |auditorid                     |integer                    |NO         |
| 29 |public      |auditor             |solicitudid                   |integer                    |YES        |
| 30 |public      |auditor             |auditorfecha                  |timestamp without time zone|YES        |
| 31 |public      |auditor             |estado_id                     |smallint                   |YES        |
| 32 |public      |auditor             |estadoanterior                |smallint                   |YES        |
| 33 |public      |auditor             |usuarios_id                   |character                  |YES        |
| 34 |public      |auditor             |usuarioanterior               |character                  |YES        |
| 35 |public      |auditor             |auditorobservacion            |character                  |YES        |
| 36 |public      |campana             |campanaid                     |smallint                   |NO         |
| 37 |public      |campana             |campanadescripcion            |text                       |YES        |
| 38 |public      |campana             |campanahabilitado             |smallint                   |YES        |
| 39 |public      |campana             |campanasistema                |smallint                   |YES        |
| 40 |public      |cargo               |cargoid                       |smallint                   |NO         |
| 41 |public      |cargo               |cargodescripcion              |character                  |YES        |
| 42 |public      |ciudadano           |ciudadanorut                  |integer                    |NO         |
| 43 |public      |ciudadano           |ciudadanodv                   |character                  |YES        |
| 44 |public      |ciudadano           |ciudadanonombres              |character                  |YES        |
| 45 |public      |ciudadano           |ciudadanopaterno              |character                  |YES        |
| 46 |public      |ciudadano           |ciudadanomaterno              |character                  |YES        |
| 47 |public      |ciudadano           |ciudadanotelefono1            |character                  |YES        |
| 48 |public      |ciudadano           |ciudadanotelefono2            |character                  |YES        |
| 49 |public      |ciudadano           |ciudadanoemail                |character                  |YES        |
| 50 |public      |ciudadano           |ciudadanocorepa               |integer                    |YES        |
| 51 |public      |ciudadano           |ciudadanoinstitucion          |character                  |YES        |
| 52 |public      |ciudadano           |ocupacionid                   |smallint                   |YES        |
| 53 |public      |ciudadano           |generoid                      |smallint                   |YES        |
| 54 |public      |ciudadano           |paisid                        |smallint                   |YES        |
| 55 |public      |ciudadano           |edadid                        |smallint                   |YES        |
| 56 |public      |ciudadano           |nombrecompleto                |character                  |YES        |
| 57 |public      |ciudadano           |ciudadanorutguion             |character                  |YES        |
| 58 |public      |ciudadano           |ciudadanoregion               |smallint                   |YES        |
| 59 |public      |ciudadano           |pueblosid                     |smallint                   |YES        |
| 60 |public      |ciudadano           |ciudadanootrotipo             |character                  |YES        |
| 61 |public      |ciudadano           |ciudadanocargoid              |smallint                   |YES        |
| 62 |public      |ciudadano           |ciudadanoinstitucionid        |smallint                   |YES        |
| 63 |public      |ciudadano           |ciudadanonombreotrainstitucion|character                  |YES        |
| 64 |public      |ciudadano           |ciudadanocomunainstitucion    |integer                    |YES        |
| 65 |public      |ciudadano           |ciudadanoregioninstitucion    |smallint                   |YES        |
| 66 |public      |ciudadano           |ciudadanotipoinstitucion      |smallint                   |YES        |
| 67 |public      |ciudadano           |ciudadanoorigen               |smallint                   |YES        |
| 68 |public      |ciudadano           |ciudadanooficinafap           |smallint                   |YES        |
| 69 |public      |ciudadano           |ciudadanopreferenteid         |smallint                   |YES        |
| 70 |public      |ciudadano           |ciudadanoconsultanteid        |smallint                   |YES        |
| 71 |public      |ciudadano           |ciudadanocuidador             |smallint                   |YES        |
| 72 |public      |ciudadano           |sexoid                        |smallint                   |YES        |
| 73 |public      |ciudadano           |ciudadanootropais             |character                  |YES        |
| 74 |public      |ciudadano           |ciudadanotipoid               |smallint                   |YES        |
| 75 |public      |ciudadano           |ciudadanonacionalidad         |smallint                   |YES        |
| 76 |public      |ciudadano           |ciudadanootraocupacion        |character                  |YES        |
| 77 |public      |ciudadanotipo       |ciudadanotipoid               |smallint                   |NO         |
| 78 |public      |ciudadanotipo       |ciudadanotipodescripcion      |character                  |YES        |
| 79 |public      |clasificacion       |clasificacionid               |smallint                   |NO         |
| 80 |public      |clasificacion       |clasificaciondescripcion      |character                  |YES        |
| 81 |public      |clasificacion       |clasificacionhabilitado       |smallint                   |YES        |
| 82 |public      |consultantetipo     |consultantetipoid             |smallint                   |NO         |
| 83 |public      |consultantetipo     |consultantetipodescripcion    |character                  |YES        |
| 84 |public      |corepa              |comunaid                      |integer                    |NO         |
| 85 |public      |corepa              |provinciaid                   |smallint                   |YES        |
| 86 |public      |corepa              |comunadescripcion             |character                  |YES        |
| 87 |public      |descripcion         |descripcionid                 |smallint                   |NO         |
| 88 |public      |descripcion         |descripciondescripcion        |character                  |YES        |
| 89 |public      |descripcion         |descripcionhabilitado         |smallint                   |YES        |
| 90 |public      |despacho            |despachoid                    |integer                    |NO         |
| 91 |public      |despacho            |solicitud_id                  |integer                    |YES        |
| 92 |public      |despacho            |despachofecha                 |timestamp without time zone|YES        |
| 93 |public      |despacho            |despachoorigen                |character                  |YES        |
| 94 |public      |despacho            |despachodestino               |character                  |YES        |
| 95 |public      |despacho            |despachotitulo                |character                  |YES        |
| 96 |public      |despacho            |despachoestado                |smallint                   |YES        |
| 97 |public      |despacho            |despachomensaje               |text                       |YES        |
| 98 |public      |despacho            |despachoattach                |bytea                      |YES        |
| 99 |public      |despacho            |despachonombreattach          |character                  |YES        |
| 100|public      |despacho            |despachousuarioold            |character                  |YES        |
| 101|public      |despacho            |despachousuario               |character                  |YES        |
| 102|public      |despacho            |despachoextensionattach       |character                  |YES        |
| 103|public      |detalle             |solicitudid                   |integer                    |NO         |
| 104|public      |detalle             |detalleid                     |integer                    |NO         |
| 105|public      |detalle             |origensolicitudid             |smallint                   |YES        |
| 106|public      |detalle             |detalleobs                    |character                  |YES        |
| 107|public      |detalle             |detalleobssgi                 |character                  |YES        |
| 108|public      |detalle             |detallederiva                 |text                       |YES        |
| 109|public      |detalle             |detalleconsulta               |text                       |YES        |
| 110|public      |edad                |edadid                        |smallint                   |NO         |
| 111|public      |edad                |edaddescripcion               |character                  |YES        |
| 112|public      |edad                |edadhabilitado                |smallint                   |YES        |
| 113|public      |encuestafap         |encuestafapsolicitudid        |integer                    |NO         |
| 114|public      |encuestafap         |encuestafaprut                |integer                    |YES        |
| 115|public      |encuestafap         |encuestafapfecha              |date                       |YES        |
| 116|public      |encuestafap         |encuestafaphora               |character                  |YES        |
| 117|public      |encuestafap         |encuestafapp1                 |smallint                   |YES        |
| 118|public      |encuestafap         |encuestafapp2                 |smallint                   |YES        |
| 119|public      |encuestafap         |encuestafapp3                 |smallint                   |YES        |
| 120|public      |encuestafap         |encuestafapp4                 |smallint                   |YES        |
| 121|public      |encuestafap         |encuestafapp5                 |smallint                   |YES        |
| 122|public      |encuestafap         |encuestafapp6                 |smallint                   |YES        |
| 123|public      |encuestafap         |encuestafapok                 |smallint                   |YES        |
| 124|public      |encuestasiiac       |encuestasiiacsolicitudid      |integer                    |NO         |
| 125|public      |encuestasiiac       |encuestasiiacrut              |integer                    |YES        |
| 126|public      |encuestasiiac       |encuestasiiacfecha            |date                       |YES        |
| 127|public      |encuestasiiac       |encuestasiiachora             |character                  |YES        |
| 128|public      |encuestasiiac       |encuestasiiacp1               |smallint                   |YES        |
| 129|public      |encuestasiiac       |encuestasiiacp2               |smallint                   |YES        |
| 130|public      |encuestasiiac       |encuestasiiacp3               |smallint                   |YES        |
| 131|public      |encuestasiiac       |encuestasiiacp4               |smallint                   |YES        |
| 132|public      |encuestasiiac       |encuestasiiacp5               |smallint                   |YES        |
| 133|public      |encuestasiiac       |encuestasiiacp6               |smallint                   |YES        |
| 134|public      |encuestasiiac       |encuestasiiacp7               |smallint                   |YES        |
| 135|public      |encuestasiiac       |encuestasiiacp8               |smallint                   |YES        |
| 136|public      |encuestasiiac       |encuestasiiacp9               |smallint                   |YES        |
| 137|public      |encuestasiiac       |encuestasiiacok               |smallint                   |YES        |
| 138|public      |errorlog            |errorlogid                    |integer                    |NO         |
| 139|public      |errorlog            |errorlogfecha                 |timestamp without time zone|YES        |
| 140|public      |errorlog            |errorlogobj                   |character                  |YES        |
| 141|public      |errorlog            |errorlogtipo                  |character                  |YES        |
| 142|public      |errorlog            |errorlogcodigo                |smallint                   |YES        |
| 143|public      |errorlog            |errorlogmensaje               |character                  |YES        |
| 144|public      |estado              |estadoid                      |smallint                   |NO         |
| 145|public      |estado              |estadodescripcion             |character                  |YES        |
| 146|public      |feriados            |feriadosfecha                 |date                       |NO         |
| 147|public      |feriados            |feriadosdescripcion           |character                  |YES        |
| 148|public      |formatos            |formatoid                     |smallint                   |NO         |
| 149|public      |formatos            |formatonombre                 |character                  |YES        |
| 150|public      |formatos            |formatoarchivo                |bytea                      |YES        |
| 151|public      |formatos            |formatosextension             |character                  |YES        |
| 152|public      |genero              |generoid                      |smallint                   |NO         |
| 153|public      |genero              |generodescripcion             |character                  |YES        |
| 154|public      |genero              |generofaphabilitado           |smallint                   |YES        |
| 155|public      |genero              |generosiiachabilitado         |smallint                   |YES        |
| 156|public      |institucion         |institucionid                 |smallint                   |NO         |
| 157|public      |institucion         |instituciondescripcion        |character                  |YES        |
| 158|public      |institucion         |institucioncomunaid           |integer                    |YES        |
| 159|public      |jornada             |jornadaid                     |smallint                   |NO         |
| 160|public      |jornada             |jornadadia                    |character                  |YES        |
| 161|public      |jornada             |jornadadesdehora              |smallint                   |YES        |
| 162|public      |jornada             |jornadadesdeminuto            |smallint                   |YES        |
| 163|public      |jornada             |jornadahastahora              |smallint                   |YES        |
| 164|public      |jornada             |jornadahastaminuto            |smallint                   |YES        |
| 165|public      |log                 |logid                         |bigint                     |NO         |
| 166|public      |log                 |logusuariosid                 |character                  |YES        |
| 167|public      |log                 |logkey                        |integer                    |YES        |
| 168|public      |log                 |logfecha                      |date                       |YES        |
| 169|public      |log                 |loghora                       |character                  |YES        |
| 170|public      |log                 |logobjeto                     |character                  |YES        |
| 171|public      |log                 |logdescripcion                |character                  |YES        |
| 172|public      |log                 |logip                         |character                  |YES        |
| 173|public      |loginlog            |loginlogid                    |bigint                     |NO         |
| 174|public      |loginlog            |loginlogusuariosid            |character                  |YES        |
| 175|public      |loginlog            |loginlogfecha                 |date                       |YES        |
| 176|public      |loginlog            |loginloghora                  |character                  |YES        |
| 177|public      |loginlog            |loginlogobjeto                |character                  |YES        |
| 178|public      |loginlog            |loginlogdescripcion           |character                  |YES        |
| 179|public      |loginlog            |loginlogkey                   |integer                    |YES        |
| 180|public      |loginlog            |loginip                       |character                  |YES        |
| 181|public      |ocupacion           |ocupacionid                   |smallint                   |NO         |
| 182|public      |ocupacion           |ocupacionformulario           |smallint                   |NO         |
| 183|public      |ocupacion           |ocupaciondescripcion          |character                  |YES        |
| 184|public      |ocupacion           |ocupacionhabilitado           |smallint                   |YES        |
| 185|public      |ocupacion           |ocupacionfaphabilitado        |smallint                   |YES        |
| 186|public      |oficinas            |oficinasid                    |smallint                   |NO         |
| 187|public      |oficinas            |regionid                      |smallint                   |YES        |
| 188|public      |oficinas            |oficinasdescripcion           |character                  |YES        |
| 189|public      |oficinasfap         |oficinasfapid                 |smallint                   |NO         |
| 190|public      |oficinasfap         |oficinasfapdescripcion        |character                  |YES        |
| 191|public      |oficinasfap         |regionid                      |smallint                   |YES        |
| 192|public      |oficinasfap         |oficinasfapcomuna             |integer                    |YES        |
| 193|public      |opcion              |opcionid                      |smallint                   |NO         |
| 194|public      |opcion              |opcionpadre                   |smallint                   |YES        |
| 195|public      |opcion              |opciondescripcion             |character                  |YES        |
| 196|public      |opcion              |opcionpath                    |character                  |YES        |
| 197|public      |opcion              |opcionorden                   |smallint                   |YES        |
| 198|public      |opcion              |opcionicono                   |character                  |YES        |
| 199|public      |origensolicitud     |origensolicitudid             |smallint                   |NO         |
| 200|public      |origensolicitud     |origensolicituddescripcion    |character                  |YES        |
| 201|public      |origensolicitud     |origensolicitudhabilitado     |smallint                   |YES        |
| 202|public      |pais                |paisid                        |smallint                   |NO         |
| 203|public      |pais                |paisprefijo                   |character                  |YES        |
| 204|public      |pais                |paisdescripcion               |character                  |YES        |
| 205|public      |parametros          |parametrosid                  |integer                    |NO         |
| 206|public      |parametros          |parametrosdescripcion         |character                  |YES        |
| 207|public      |parametros          |parametrosvalor               |text                       |YES        |
| 208|public      |parametros          |parametrosorigen              |smallint                   |YES        |
| 209|public      |perfil              |perfilid                      |smallint                   |NO         |
| 210|public      |perfil              |perfildescripcion             |character                  |YES        |
| 211|public      |perfil              |perfilhabilitado              |smallint                   |YES        |
| 212|public      |perfil              |perfilregional                |smallint                   |YES        |
| 213|public      |perfil              |perfilsis                     |smallint                   |YES        |
| 214|public      |perfilopcion        |perfilid                      |smallint                   |NO         |
| 215|public      |perfilopcion        |opcionid                      |smallint                   |NO         |
| 216|public      |perfilopcion        |sistemaid                     |smallint                   |NO         |
| 217|public      |preferente          |preferenteid                  |smallint                   |NO         |
| 218|public      |preferente          |preferentedescripcion         |character                  |YES        |
| 219|public      |provincia           |provinciaid                   |smallint                   |NO         |
| 220|public      |provincia           |regionid                      |smallint                   |NO         |
| 221|public      |provincia           |provincianombre               |character                  |YES        |
| 222|public      |pueblos             |pueblosid                     |smallint                   |NO         |
| 223|public      |pueblos             |pueblosdescripcion            |character                  |YES        |
| 224|public      |region              |regionid                      |smallint                   |NO         |
| 225|public      |region              |regiondescripcion             |character                  |YES        |
| 226|public      |reporte             |r_regionid                    |smallint                   |NO         |
| 227|public      |reporte             |r_solicitudfecha              |timestamp without time zone|NO         |
| 228|public      |reporte             |r_solicitudid                 |integer                    |NO         |
| 229|public      |reporte             |r_estadoid                    |smallint                   |YES        |
| 230|public      |reporte             |r_tiposolicitudid             |smallint                   |YES        |
| 231|public      |reporte             |r_tiposolicituddescripcion    |character                  |YES        |
| 232|public      |reporte             |r_codigotematica              |character                  |YES        |
| 233|public      |reporte             |r_tematica                    |character                  |YES        |
| 234|public      |reporte             |r_ciudadanorut                |integer                    |YES        |
| 235|public      |reporte             |r_ciudadanodv                 |character                  |YES        |
| 236|public      |reporte             |r_generodescripcion           |character                  |YES        |
| 237|public      |reporte             |r_edaddescripcion             |character                  |YES        |
| 238|public      |reporte             |r_paisdescripcion             |character                  |YES        |
| 239|public      |reporte             |r_regiondescripcion           |character                  |YES        |
| 240|public      |reporte             |r_provinciaid                 |smallint                   |YES        |
| 241|public      |reporte             |r_provinciadescripcion        |character                  |YES        |
| 242|public      |reporte             |r_comunaid                    |integer                    |YES        |
| 243|public      |reporte             |r_ocupacionid                 |smallint                   |YES        |
| 244|public      |reporte             |r_ocupaciondescripcion        |character                  |YES        |
| 245|public      |reporte             |r_paisid                      |smallint                   |YES        |
| 246|public      |reporte             |r_ciudadanoemail              |character                  |YES        |
| 247|public      |reporte             |r_ciudadanoinstitucion        |character                  |YES        |
| 248|public      |reporte             |r_estadodescripcion           |character                  |YES        |
| 249|public      |reporte             |r_solicitudtomadocod          |character                  |YES        |
| 250|public      |reporte             |r_fechainicio                 |timestamp without time zone|YES        |
| 251|public      |reporte             |r_horainicio                  |character                  |YES        |
| 252|public      |reporte             |r_fechaingreso                |timestamp without time zone|YES        |
| 253|public      |reporte             |r_horaingreso                 |character                  |YES        |
| 254|public      |reporte             |r_fechacierre                 |timestamp without time zone|YES        |
| 255|public      |reporte             |r_horacierre                  |character                  |YES        |
| 256|public      |reporte             |r_diascierre                  |smallint                   |YES        |
| 257|public      |reporte             |r_profesionalcierre           |character                  |YES        |
| 258|public      |reporte             |r_derivada                    |character                  |YES        |
| 259|public      |reporte             |r_fecha1respuesta             |timestamp without time zone|YES        |
| 260|public      |reporte             |r_dias1respuesta              |smallint                   |YES        |
| 261|public      |reporte             |r_pregunta                    |text                       |YES        |
| 262|public      |reporte             |r_respuesta                   |text                       |YES        |
| 263|public      |reporte             |r_resolutivo                  |character                  |YES        |
| 264|public      |reporte             |r_formato                     |character                  |YES        |
| 265|public      |reporte             |r_derivado                    |character                  |YES        |
| 266|public      |reporte             |r_desistido                   |character                  |YES        |
| 267|public      |reporte             |r_obsdesistido                |character                  |YES        |
| 268|public      |reporte             |r_pueblooriginario            |character                  |YES        |
| 269|public      |reporte             |r_area                        |smallint                   |YES        |
| 270|public      |reporte             |r_subarea                     |smallint                   |YES        |
| 271|public      |reporte             |r_clasificacion               |smallint                   |YES        |
| 272|public      |reporte             |r_ciudadanorutguion           |character                  |YES        |
| 273|public      |reporte             |r_nombrecompleto              |character                  |YES        |
| 274|public      |reporte             |r_ciudadanoregionid           |smallint                   |YES        |
| 275|public      |reporte             |r_tipoformularioid            |smallint                   |YES        |
| 276|public      |reporte             |r_sexo                        |character                  |YES        |
| 277|public      |reporte             |r_regionderivacionorigen      |character                  |YES        |
| 278|public      |reporte             |r_regionderivaciondestino     |character                  |YES        |
| 279|public      |reporte             |r_solicitudfechaderivacion    |timestamp without time zone|YES        |
| 280|public      |reporte             |r_nombreregion                |character                  |YES        |
| 281|public      |reporte             |e_ciudadanorut                |integer                    |YES        |
| 282|public      |reporte             |e_ciudadanodv                 |character                  |YES        |
| 283|public      |reporte             |e_nombrecompleto              |character                  |YES        |
| 284|public      |reporte             |e_sexo                        |character                  |YES        |
| 285|public      |reporte             |e_generodescripcion           |character                  |YES        |
| 286|public      |reporte             |e_edaddescripcion             |character                  |YES        |
| 287|public      |reporte             |r_ciudadanotelefono           |character                  |YES        |
| 288|public      |reporte             |e_ciudadanotelefono           |character                  |YES        |
| 289|public      |reporte             |e_ciudadanoemail              |character                  |YES        |
| 290|public      |reporte             |e_paisid                      |smallint                   |YES        |
| 291|public      |reporte             |e_paisdescripcion             |character                  |YES        |
| 292|public      |reporte             |e_ciudadanoregionid           |smallint                   |YES        |
| 293|public      |reporte             |e_regiondescripcion           |character                  |YES        |
| 294|public      |reporte             |e_provinciaid                 |smallint                   |YES        |
| 295|public      |reporte             |e_provinciadescripcion        |character                  |YES        |
| 296|public      |reporte             |e_comunaid                    |integer                    |YES        |
| 297|public      |reporte             |e_pueblooriginario            |character                  |YES        |
| 298|public      |reporte             |e_ocupacionid                 |smallint                   |YES        |
| 299|public      |reporte             |e_ocupaciondescripcion        |character                  |YES        |
| 300|public      |reporte             |e_ciudadanoinstitucion        |character                  |YES        |
| 301|public      |reporte             |e_ciudadanorutguion           |character                  |YES        |
| 302|public      |reporte             |r_profesionalderivado         |character                  |YES        |
| 303|public      |reporte             |r_comunadescripcion           |character                  |YES        |
| 304|public      |reporte             |e_comunadescripcion           |character                  |YES        |
| 305|public      |reporte             |r_solicitudtomadonombre       |character                  |YES        |
| 306|public      |reporte             |r_tipousuario                 |character                  |YES        |
| 307|public      |reporte             |r_escuidador                  |character                  |YES        |
| 308|public      |reportefap          |r_fapsolicitudid              |integer                    |NO         |
| 309|public      |reportefap          |r_fapfechainicio              |date                       |NO         |
| 310|public      |reportefap          |r_faptiposolicitud            |character                  |YES        |
| 311|public      |reportefap          |r_fapconsultantetipo          |character                  |YES        |
| 312|public      |reportefap          |r_faphorainicio               |character                  |YES        |
| 313|public      |reportefap          |r_faphorafin                  |character                  |YES        |
| 314|public      |reportefap          |r_fapciudadanoregion          |character                  |YES        |
| 315|public      |reportefap          |r_fapciudadanocomuna          |character                  |YES        |
| 316|public      |reportefap          |r_fapciudadanorut             |character                  |YES        |
| 317|public      |reportefap          |r_fapciudadanonombres         |character                  |YES        |
| 318|public      |reportefap          |r_fapciudadanopaterno         |character                  |YES        |
| 319|public      |reportefap          |r_fapciudadanomaterno         |character                  |YES        |
| 320|public      |reportefap          |r_fapciudadanosexo            |character                  |YES        |
| 321|public      |reportefap          |r_fapciudadanogenero          |character                  |YES        |
| 322|public      |reportefap          |r_fapciudadanoemail           |character                  |YES        |
| 323|public      |reportefap          |r_fapciudadanotelefono        |character                  |YES        |
| 324|public      |reportefap          |r_fapciudadanopreferente      |character                  |YES        |
| 325|public      |reportefap          |r_fapciudadanocuidador        |character                  |YES        |
| 326|public      |reportefap          |r_faparea                     |character                  |YES        |
| 327|public      |reportefap          |r_fapsubarea                  |character                  |YES        |
| 328|public      |reportefap          |r_fapclasificacion            |character                  |YES        |
| 329|public      |reportefap          |r_fappregunta                 |text                       |YES        |
| 330|public      |reportefap          |r_faprespuesta                |text                       |YES        |
| 331|public      |reportefap          |r_fapadjuntos                 |character                  |YES        |
| 332|public      |reportefap          |r_fapinsumos                  |character                  |YES        |
| 333|public      |reportefap          |r_fapusuario                  |character                  |YES        |
| 334|public      |reportefap          |r_fapregion                   |character                  |YES        |
| 335|public      |reportefap          |r_fapoficina                  |character                  |YES        |
| 336|public      |reportefap          |r_fapestudianterut            |character                  |YES        |
| 337|public      |reportefap          |r_fapestudiantenombre         |character                  |YES        |
| 338|public      |reportefap          |r_fapestudiantepaterno        |character                  |YES        |
| 339|public      |reportefap          |r_solicitudfaptiposolicitud   |smallint                   |YES        |
| 340|public      |reportefap          |r_areafap_id                  |smallint                   |YES        |
| 341|public      |reportefap          |r_subareafap_id               |smallint                   |YES        |
| 342|public      |reportefap          |r_clasificacionfap_id         |smallint                   |YES        |
| 343|public      |reportefap          |r_ciudadanopreferenteid       |smallint                   |YES        |
| 344|public      |reportefap          |r_regionfapid                 |smallint                   |YES        |
| 345|public      |reportefap          |r_ciudadanocorepa             |integer                    |YES        |
| 346|public      |reportefap          |r_oficinasfapid               |smallint                   |YES        |
| 347|public      |reportefap          |r_fapfecha                    |date                       |YES        |
| 348|public      |reportefap          |r_fapfechafin                 |date                       |YES        |
| 349|public      |respuesta           |solicitud__id                 |integer                    |NO         |
| 350|public      |respuesta           |primerarespuesta              |text                       |YES        |
| 351|public      |respuesta           |respuestafinal                |text                       |YES        |
| 352|public      |respuesta           |primerarespuestatxt           |text                       |YES        |
| 353|public      |respuesta           |respuestafinaltxt             |text                       |YES        |
| 354|public      |sexo                |sexoid                        |smallint                   |NO         |
| 355|public      |sexo                |sexodescripcion               |character                  |YES        |
| 356|public      |sexo                |sexosiiachabilitado           |smallint                   |NO         |
| 357|public      |sexo                |sexofaphabilitado             |smallint                   |NO         |
| 358|public      |solicitud           |solicitudid                   |integer                    |NO         |
| 359|public      |solicitud           |solicitudregion               |smallint                   |YES        |
| 360|public      |solicitud           |solicitudfecha                |timestamp without time zone|YES        |
| 361|public      |solicitud           |area_id                       |smallint                   |YES        |
| 362|public      |solicitud           |subarea_id                    |smallint                   |YES        |
| 363|public      |solicitud           |clasificacion_id              |smallint                   |YES        |
| 364|public      |solicitud           |solicitudtomadocod            |character                  |YES        |
| 365|public      |solicitud           |solicitudformato              |character                  |YES        |
| 366|public      |solicitud           |solicitudresolutivo           |character                  |YES        |
| 367|public      |solicitud           |solicitudderivado             |character                  |YES        |
| 368|public      |solicitud           |solicituddesistido            |character                  |YES        |
| 369|public      |solicitud           |solicituddesistidoobs         |character                  |YES        |
| 370|public      |solicitud           |diasprimerarespuesta          |smallint                   |YES        |
| 371|public      |solicitud           |diasrespuestafinal            |smallint                   |YES        |
| 372|public      |solicitud           |solicitudderivaobs            |text                       |YES        |
| 373|public      |solicitud           |solicitudderivaresp           |text                       |YES        |
| 374|public      |solicitud           |estadosemaforo                |smallint                   |YES        |
| 375|public      |solicitud           |solicituddias                 |smallint                   |YES        |
| 376|public      |solicitud           |solicitudtomado               |smallint                   |YES        |
| 377|public      |solicitud           |solicitudfoliofap             |integer                    |YES        |
| 378|public      |solicitud           |ciudadanorut                  |integer                    |YES        |
| 379|public      |solicitud           |tiposolicitudid               |smallint                   |YES        |
| 380|public      |solicitud           |estadoid                      |smallint                   |YES        |
| 381|public      |solicitud           |rutsolicitante                |integer                    |YES        |
| 382|public      |solicitud           |rutsolicitado                 |integer                    |YES        |
| 383|public      |solicitud           |solicitudconsultaestudiante   |smallint                   |YES        |
| 384|public      |solicitud           |solicitudtipoformulario       |smallint                   |YES        |
| 385|public      |solicitud           |regionderivacionorigen        |smallint                   |YES        |
| 386|public      |solicitud           |regionderivaciondestino       |smallint                   |YES        |
| 387|public      |solicitud           |solicitudfechaderivacion      |date                       |YES        |
| 388|public      |solicitud           |solicitudusuariosid           |character                  |YES        |
| 389|public      |solicitud           |solicitudfechatomado          |date                       |YES        |
| 390|public      |solicitud           |solicitudhoratomado           |character                  |YES        |
| 391|public      |solicitud           |solicitudhoraderivacion       |character                  |YES        |
| 392|public      |solicitud           |solicitudfechaingreso         |date                       |YES        |
| 393|public      |solicitud           |solicitudhoraingreso          |character                  |YES        |
| 394|public      |solicitud           |solicitudfechacierre          |date                       |YES        |
| 395|public      |solicitud           |solicitudhoracierre           |character                  |YES        |
| 396|public      |solicitud           |solicitudfechaprimera         |date                       |YES        |
| 397|public      |solicitud           |solicitudhoraprimera          |character                  |YES        |
| 398|public      |solicitud           |solicitudfechautc             |timestamp without time zone|YES        |
| 399|public      |solicitud           |solicitudfechamarca           |smallint                   |YES        |
| 400|public      |solicitudfap        |solicitudfapid                |integer                    |NO         |
| 401|public      |solicitudfap        |ciudadanorut                  |integer                    |YES        |
| 402|public      |solicitudfap        |regionfapid                   |smallint                   |YES        |
| 403|public      |solicitudfap        |solicitudfapestadoid          |smallint                   |YES        |
| 404|public      |solicitudfap        |solicitudfapfecha             |date                       |YES        |
| 405|public      |solicitudfap        |solicitudfapfechareg          |date                       |YES        |
| 406|public      |solicitudfap        |solicitudfapusuariosid        |character                  |YES        |
| 407|public      |solicitudfap        |areafap_id                    |smallint                   |YES        |
| 408|public      |solicitudfap        |solicitudfappregunta          |text                       |YES        |
| 409|public      |solicitudfap        |solicitudfaprespuesta         |text                       |YES        |
| 410|public      |solicitudfap        |solicitudfapderivado          |smallint                   |YES        |
| 411|public      |solicitudfap        |solicitudfapencargado         |character                  |YES        |
| 412|public      |solicitudfap        |solicitudfaphorareg           |character                  |YES        |
| 413|public      |solicitudfap        |solicitudfapfoliosiiac        |integer                    |YES        |
| 414|public      |solicitudfap        |solicitudfapfechainicio       |date                       |YES        |
| 415|public      |solicitudfap        |solicitudfaphorainicio        |character                  |YES        |
| 416|public      |solicitudfap        |solicitudfapterminada         |smallint                   |YES        |
| 417|public      |solicitudfap        |solicitudfaptipoform          |smallint                   |YES        |
| 418|public      |solicitudfap        |oficinasfapid                 |smallint                   |YES        |
| 419|public      |solicitudfap        |solicitudfaptiposolicitud     |smallint                   |YES        |
| 420|public      |solicitudfap        |subareafap_id                 |smallint                   |YES        |
| 421|public      |solicitudfap        |clasificacionfap_id           |smallint                   |YES        |
| 422|public      |solicitudfap        |subareaclasificacion_id       |smallint                   |YES        |
| 423|public      |solicitudfap        |fapfechainicio                |date                       |YES        |
| 424|public      |solicitudfap        |faphorainicio                 |character                  |YES        |
| 425|public      |solicitudfap        |fapfechafin                   |date                       |YES        |
| 426|public      |solicitudfap        |faphorafin                    |character                  |YES        |
| 427|public      |solicitudfap        |estudianterut                 |integer                    |YES        |
| 428|public      |solicitudfap        |insumos                       |smallint                   |YES        |
| 429|public      |solicitudfap        |estudianterutguion            |character                  |YES        |
| 430|public      |solicitudfap        |usuariosfapnombre             |character                  |YES        |
| 431|public      |subarea             |subareaid                     |smallint                   |NO         |
| 432|public      |subarea             |areaid                        |smallint                   |YES        |
| 433|public      |subarea             |subareadescripcion            |character                  |YES        |
| 434|public      |subarea             |subareahabilitado             |smallint                   |YES        |
| 435|public      |subareaclasificacion|subareaclasificacionarea      |smallint                   |NO         |
| 436|public      |subareaclasificacion|subareaid                     |smallint                   |NO         |
| 437|public      |subareaclasificacion|clasificacionid               |smallint                   |NO         |
| 438|public      |subareaclasificacion|subareaclasificacionhabilitado|smallint                   |YES        |
| 439|public      |subareaclasificacion|subareaclasificacionid        |smallint                   |YES        |
| 440|public      |subareaclasificacion|subareaclasificaciondesc      |character                  |YES        |
| 441|public      |tematica            |tematicaid                    |smallint                   |NO         |
| 442|public      |tematica            |areafapid                     |smallint                   |NO         |
| 443|public      |tematica            |tematicadescripcion           |character                  |YES        |
| 444|public      |tematica            |tematicahabilitado            |smallint                   |YES        |
| 445|public      |tematicadescripcion |tematicaid                    |smallint                   |NO         |
| 446|public      |tematicadescripcion |descripcionid                 |smallint                   |NO         |
| 447|public      |tematicadescripcion |tematicadescripcionhabilitado |smallint                   |YES        |
| 448|public      |tipoformulario      |tipoformularioid              |smallint                   |NO         |
| 449|public      |tipoformulario      |tipoformulariodescripcion     |character                  |NO         |
| 450|public      |tipoinstitucion     |tipoinstitucionid             |smallint                   |NO         |
| 451|public      |tipoinstitucion     |tipoinstituciondescripcion    |character                  |YES        |
| 452|public      |tiposolicitud       |tiposolicitudid               |smallint                   |NO         |
| 453|public      |tiposolicitud       |tiposolicituddescripcion      |character                  |YES        |
| 454|public      |tiposolicitud       |tiposolicitudprefijo          |character                  |YES        |
| 455|public      |tiposolicitud       |tiposolicitudhabilitado       |smallint                   |YES        |
| 456|public      |tmpciudadano        |tmp_rutciudadano              |integer                    |NO         |
| 457|public      |tmpciudadano        |tmp_ciudadanodv               |character                  |YES        |
| 458|public      |tmpciudadano        |tmp_ciudadanonombres          |character                  |YES        |
| 459|public      |tmpciudadano        |tmp_ciudadanopaterno          |character                  |YES        |
| 460|public      |tmpciudadano        |tmp_ciudadanomaterno          |character                  |YES        |
| 461|public      |tmpciudadano        |tmp_ciudadanotelefono1        |character                  |YES        |
| 462|public      |tmpciudadano        |tmp_ciudadanotelefono2        |character                  |YES        |
| 463|public      |tmpciudadano        |tmp_ciudadanoemail            |character                  |YES        |
| 464|public      |tmpciudadano        |tmp_ciudadanocorepa           |integer                    |YES        |
| 465|public      |tmpciudadano        |tmp_ciudadanoinstitucion      |character                  |YES        |
| 466|public      |tmpciudadano        |tmp_ocupacionid               |smallint                   |YES        |
| 467|public      |tmpciudadano        |tmp_ciudadanootraocupacion    |character                  |YES        |
| 468|public      |tmpciudadano        |tmp_sexoid                    |smallint                   |YES        |
| 469|public      |tmpciudadano        |tmp_generoid                  |smallint                   |YES        |
| 470|public      |tmpciudadano        |tmp_paisid                    |smallint                   |YES        |
| 471|public      |tmpciudadano        |tmp_edadid                    |smallint                   |YES        |
| 472|public      |tmpciudadano        |tmp_ciudadanootrotipo         |character                  |YES        |
| 473|public      |tmpciudadano        |tmp_ciudadanorutguion         |character                  |YES        |
| 474|public      |tmpciudadano        |tmp_nombrecompleto            |character                  |YES        |
| 475|public      |tmpciudadano        |tmp_ciudadanoregion           |smallint                   |YES        |
| 476|public      |tmpciudadano        |tmp_pueblosid                 |smallint                   |YES        |
| 477|public      |tmpciudadano        |tmp_ciudadanocargoid          |smallint                   |YES        |
| 478|public      |tmpciudadano        |tmp_ciudadanoinstitucionid    |smallint                   |YES        |
| 479|public      |tmpciudadano        |tmp_ciudadanonombreotrainstitu|character                  |YES        |
| 480|public      |tmpciudadano        |tmp_ciudadanocomunainstitucion|smallint                   |YES        |
| 481|public      |tmpciudadano        |tmp_ciudadanoregioninstitucion|smallint                   |YES        |
| 482|public      |tmpciudadano        |tmp_ciudadanotipoinstitucion  |smallint                   |YES        |
| 483|public      |tmpciudadano        |tmp_ciudadanoorigen           |smallint                   |YES        |
| 484|public      |tmpciudadano        |tmp_ciudadanooficinafap       |smallint                   |YES        |
| 485|public      |tmpciudadano        |tmp_ciudadanopreferenteid     |smallint                   |YES        |
| 486|public      |tmpciudadano        |tmp_ciudadanoconsultanteid    |smallint                   |YES        |
| 487|public      |tmpciudadano        |tmp_ciudadanocuidador         |smallint                   |YES        |
| 488|public      |tmpciudadano        |tmp_ciudadanootropais         |character                  |YES        |
| 489|public      |tmpciudadano        |tmp_ciudadanotipoid           |smallint                   |YES        |
| 490|public      |tmpciudadano        |tmp_ciudadanonacionalidad     |smallint                   |YES        |
| 491|public      |tmpciudadano        |tmp_traspasado                |character                  |YES        |
| 492|public      |tmpsolicitudfap     |tmp_solicitudfapid            |integer                    |NO         |
| 493|public      |tmpsolicitudfap     |tmp_ciudadanorut              |integer                    |YES        |
| 494|public      |tmpsolicitudfap     |tmp_regionfapid               |smallint                   |YES        |
| 495|public      |tmpsolicitudfap     |tmp_oficinasfapid             |smallint                   |YES        |
| 496|public      |tmpsolicitudfap     |tmp_solicitudfapestadoid      |smallint                   |YES        |
| 497|public      |tmpsolicitudfap     |tmp_solicitudfapfecha         |date                       |YES        |
| 498|public      |tmpsolicitudfap     |tmp_solicitudfapfechareg      |date                       |YES        |
| 499|public      |tmpsolicitudfap     |tmp_solicitudfaphorareg       |character                  |YES        |
| 500|public      |tmpsolicitudfap     |tmp_solicitudfapusuariosid    |character                  |YES        |
| 501|public      |tmpsolicitudfap     |tmp_areafap_id                |smallint                   |YES        |
| 502|public      |tmpsolicitudfap     |tmp_subareafap_id             |smallint                   |YES        |
| 503|public      |tmpsolicitudfap     |tmp_clasificacionfap_id       |smallint                   |YES        |
| 504|public      |tmpsolicitudfap     |tmp_solicitudfappregunta      |text                       |YES        |
| 505|public      |tmpsolicitudfap     |tmp_solicitudfaprespuesta     |text                       |YES        |
| 506|public      |tmpsolicitudfap     |tmp_solicitudfapderivado      |smallint                   |YES        |
| 507|public      |tmpsolicitudfap     |tmp_solicitudfapencargado     |character                  |YES        |
| 508|public      |tmpsolicitudfap     |tmp_solicitudfapfoliosiiac    |integer                    |YES        |
| 509|public      |tmpsolicitudfap     |tmp_solicitudfapfechainicio   |date                       |YES        |
| 510|public      |tmpsolicitudfap     |tmp_solicitudfaphorainicio    |character                  |YES        |
| 511|public      |tmpsolicitudfap     |tmp_solicitudfapterminada     |smallint                   |YES        |
| 512|public      |tmpsolicitudfap     |tmp_solicitudfaptipoform      |smallint                   |YES        |
| 513|public      |tmpsolicitudfap     |tmp_solicitudfaptiposolicitud |smallint                   |YES        |
| 514|public      |tmpsolicitudfap     |tmp_subareaclasificacion_id   |smallint                   |YES        |
| 515|public      |tmpsolicitudfap     |tmp_fapfechainicio            |date                       |YES        |
| 516|public      |tmpsolicitudfap     |tmp_faphorainicio             |character                  |YES        |
| 517|public      |tmpsolicitudfap     |tmp_fapfechafin               |date                       |YES        |
| 518|public      |tmpsolicitudfap     |tmp_faphorafin                |character                  |YES        |
| 519|public      |tmpsolicitudfap     |tmp_estudianterut             |integer                    |YES        |
| 520|public      |tmpsolicitudfap     |tmp_insumos                   |smallint                   |YES        |
| 521|public      |tmpsolicitudfap     |tmp_solicitudfapfolio         |integer                    |YES        |
| 522|public      |unidad              |unidadid                      |integer                    |NO         |
| 523|public      |unidad              |unidadpadre                   |integer                    |YES        |
| 524|public      |unidad              |unidadcod                     |smallint                   |YES        |
| 525|public      |unidad              |unidaddescripcion             |character                  |YES        |
| 526|public      |unidad              |unidadtipo                    |smallint                   |YES        |
| 527|public      |unidad              |unidadcodregional             |smallint                   |YES        |
| 528|public      |unidad              |region_id                     |smallint                   |YES        |
| 529|public      |unidad              |comunaid                      |integer                    |YES        |
| 530|public      |usuarioperfil       |usuariosid                    |character                  |NO         |
| 531|public      |usuarioperfil       |perfilid                      |smallint                   |NO         |
| 532|public      |usuarioperfil       |sistemaid                     |smallint                   |NO         |
| 533|public      |usuarioperfil       |usuarioperfilactivo           |smallint                   |YES        |
| 534|public      |usuarios            |usuariosid                    |character                  |NO         |
| 535|public      |usuarios            |usuariospassword              |character                  |YES        |
| 536|public      |usuarios            |usuariosnombre                |character                  |YES        |
| 537|public      |usuarios            |usuariosemail                 |character                  |YES        |
| 538|public      |usuarios            |usuarioshabilitado            |smallint                   |YES        |
| 539|public      |usuarios            |unidadid                      |integer                    |YES        |
| 540|public      |usuarios            |usuariostipovalidacion        |smallint                   |YES        |
| 541|public      |usuarios            |usuariossiiachabilitado       |smallint                   |YES        |
| 542|public      |usuarios            |usuariosfaphabilitado         |smallint                   |YES        |
| 543|public      |usuarios            |usuariosoficinafapid          |smallint                   |YES        |
| 544|public      |usuarios            |usuariosfechaalta             |date                       |YES        |
| 545|public      |usuarios            |usuarioshoraalta              |character                  |YES        |
| 546|public      |usuarios            |usuariosfechamod              |date                       |YES        |
| 547|public      |usuarios            |usuarioshoramod               |character                  |YES        |
| 548|public      |usuarios            |usuarioseditafap              |smallint                   |YES        |